import { useMemo, useEffect, useReducer, useCallback, ReactElement, createContext, useState } from 'react';

// project imports
import { supabase } from '../lib/supabase';
import accountReducer from 'store/accountReducer';
import { LOGIN, LOGOUT } from 'store/actions';
import { userService } from '../services/userService';

// types
import { InitialLoginContextProps, SupabaseContextType, DbUserProfile } from 'types/auth';

// const
const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

function setSession(serviceToken?: string | null): void {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
  } else {
    localStorage.removeItem('serviceToken');
  }
}

// ==============================|| SUPABASE CONTEXT & PROVIDER ||============================== //

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabseProvider({ children }: { children: ReactElement }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const [dbUser, setDbUser] = useState<DbUserProfile | null>(null);

  // Sync user profile with database
  const syncUserProfile = useCallback(async () => {
    try {
      const syncedUser = await userService.syncUser();
      setDbUser(syncedUser);
      return syncedUser;
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      setDbUser(null);
      return null;
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        dispatch({ type: LOGOUT, payload: { isLoggedIn: false, user: null } });
        setDbUser(null);
        console.error(error);
        throw error;
      }

      if (session?.user) {
        dispatch({ type: LOGIN, payload: { user: session?.user, isLoggedIn: true } });
        // Sync user profile with database
        await syncUserProfile();
      } else {
        dispatch({ type: LOGOUT, payload: { user: null, isLoggedIn: false } });
        setDbUser(null);
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: LOGOUT, payload: { user: null, isLoggedIn: false } });
      setDbUser(null);
    }
  }, [syncUserProfile]);

  useEffect(() => {
    initialize();

    // Listen for auth state changes (e.g., email confirmation, token refresh)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in (including via email confirmation link)
        setSession(session.access_token);
        dispatch({
          type: LOGIN,
          payload: {
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.display_name
            },
            isLoggedIn: true
          }
        });
        // Sync user profile with database
        await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setDbUser(null);
        dispatch({ type: LOGOUT });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Update the stored token
        setSession(session.access_token);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, syncUserProfile]);

  // LOGIN
  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        dispatch({ type: LOGOUT, payload: { user: null, isLoggedIn: false } });
        setDbUser(null);
        console.error(error);
        throw error;
      } else {
        setSession(data.session.access_token);
        dispatch({
          type: LOGIN,
          payload: {
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata.display_name
            },
            isLoggedIn: true
          }
        });
        // Sync user profile with database after login
        await syncUserProfile();
      }
    },
    [syncUserProfile]
  );

  // REGISTER
  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: `${firstName} ${lastName}`
        }
      }
    });

    if (error) {
      console.error(error);
      throw error;
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      throw error;
    }

    setDbUser(null);
    dispatch({
      type: LOGOUT
    });
  }, []);

  // FORGOT PASSWORD
  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `/code-verification`
    });

    if (error) {
      console.error(error);
      throw error;
    }
  }, []);

  // Computed role properties
  const isAdmin = dbUser?.role === 'ADMIN';
  const isVerified = dbUser?.isVerified ?? false;
  const canEdit = isVerified && isAdmin;

  const memoizedValue = useMemo(
    () => ({
      user: { ...state.user },
      ...state,
      dbUser,
      isAdmin,
      isVerified,
      canEdit,
      login,
      register,
      logout,
      forgotPassword
    }),
    [forgotPassword, login, logout, register, state, dbUser, isAdmin, isVerified, canEdit]
  );

  return <SupabaseContext value={memoizedValue}>{children}</SupabaseContext>;
}

export default SupabaseContext;

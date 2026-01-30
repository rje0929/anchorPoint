import { memo, useLayoutEffect, useState, useMemo } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import { MenuOrientation } from 'config';
import menuItem from 'menu-items';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';

import { HORIZONTAL_MAX_ITEM } from 'config';
import { useGetMenuMaster } from 'api/menu';

// types
import { NavItemType } from 'types';
import { UserRole } from 'types/auth';

// Helper function to filter menu items by role
function filterMenuItemsByRole(items: NavItemType[], userRole: UserRole | undefined): NavItemType[] {
  return items
    .filter((item) => {
      // If no roles specified, item is visible to all
      if (!item.roles || item.roles.length === 0) return true;
      // If roles specified, check if user has one of them
      return userRole && item.roles.includes(userRole);
    })
    .map((item) => {
      // If item has children, filter them too
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuItemsByRole(item.children, userRole)
        };
      }
      return item;
    })
    // Remove groups with no children after filtering
    .filter((item) => {
      if (item.type === 'group' && item.children) {
        return item.children.length > 0;
      }
      return true;
    });
}

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { dbUser } = useAuth();

  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [selectedID, setSelectedID] = useState<string | undefined>('');
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  // Filter menu items based on user role
  const filteredMenuItems = useMemo(() => {
    return filterMenuItemsByRole(menuItems.items, dbUser?.role);
  }, [menuItems.items, dbUser?.role]);

  useLayoutEffect(() => {
    setMenuItems({ items: [...menuItem.items] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // last menu-item to show in horizontal menu bar
  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;

  let lastItemIndex = filteredMenuItems.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  if (lastItem && lastItem < filteredMenuItems.length) {
    lastItemId = filteredMenuItems[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = filteredMenuItems.slice(lastItem - 1, filteredMenuItems.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = filteredMenuItems.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {!isHorizontal && index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return !isHorizontal ? <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box> : <>{navItems}</>;
}

export default memo(MenuList);

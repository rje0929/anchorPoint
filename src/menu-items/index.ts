import dashboard from './dashboard';
import admin from './admin';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, admin]
};

export default menuItems;

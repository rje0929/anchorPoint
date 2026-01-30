// assets
import { IconUsers, IconSettings } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
  IconUsers: IconUsers,
  IconSettings: IconSettings
};

// ==============================|| MENU ITEMS - ADMINISTRATION ||============================== //

const admin: NavItemType = {
  id: 'admin',
  title: 'Administration',
  icon: icons.IconSettings,
  type: 'group',
  roles: ['ADMIN'],
  children: [
    {
      id: 'user-management',
      title: 'Manage Users',
      type: 'item',
      url: '/admin/users',
      icon: icons.IconUsers,
      breadcrumbs: false,
      roles: ['ADMIN']
    }
  ]
};

export default admin;

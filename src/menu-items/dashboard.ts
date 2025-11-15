// assets
import { IconDashboard, IconDeviceAnalytics, IconFileInvoice, IconArticle, IconLifebuoy } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
  IconDashboard: IconDashboard,
  IconDeviceAnalytics: IconDeviceAnalytics,
  IconFileInvoice: IconFileInvoice,
  IconArticle: IconArticle,
  IconLifebuoy: IconLifebuoy
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'dashboard',
  icon: icons.IconDashboard,
  type: 'group',
  children: [
    {
      id: 'providers',
      title: 'Providers',
      type: 'item',
      url: '/dashboard/providers',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
  ]
};

export default dashboard;

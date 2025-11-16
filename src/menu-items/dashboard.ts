// assets
import { IconDashboard, IconDeviceAnalytics, IconFileInvoice, IconArticle, IconLifebuoy, IconMap2 } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
  IconDashboard: IconDashboard,
  IconDeviceAnalytics: IconDeviceAnalytics,
  IconFileInvoice: IconFileInvoice,
  IconArticle: IconArticle,
  IconLifebuoy: IconLifebuoy,
  IconMap2: IconMap2
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
    {
      id: 'provider-map',
      title: 'Provider Map',
      type: 'item',
      url: '/dashboard/provider-map',
      icon: icons.IconMap2,
      breadcrumbs: false
    }
  ]
};

export default dashboard;

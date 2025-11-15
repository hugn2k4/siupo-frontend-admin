// assets
import { IconCategory2, IconKey, IconMenu, IconSettings, IconShoppingCart, IconTable, IconUser } from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconMenu,
  IconCategory2,
  IconUser,
  IconTable,
  IconShoppingCart,
  IconSettings
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: 'Pages Caption',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'menu',
      title: 'Menu',
      type: 'collapse',
      icon: icons.IconMenu,
      children: [
        {
          id: 'menu-list',
          title: 'List Food',
          type: 'item',
          url: '/menu/list-food'
        }
      ]
    },
    {
      id: 'place-table',
      title: 'Place Table',
      type: 'collapse',
      icon: icons.IconTable,
      children: [
        {
          id: 'place-table-for-guest',
          title: 'Place Table for Guest',
          type: 'item',
          url: '/place-table/place-table-for-guest'
        },
        {
          id: 'place-table-for-customer',
          title: 'Place Table for Customer',
          type: 'item',
          url: '/place-table/place-table-for-customer'
        }
      ]
    },
    {
      id: 'banner',
      title: 'Banner Management',
      type: 'collapse',
      icon: icons.IconTable,
      children: [
        {
          id: 'banner-management',
          title: 'Banner Management',
          type: 'item',
          url: '/banner/banner-management'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification Management',
      type: 'collapse',
      icon: icons.IconTable,
      children: [
        {
          id: 'notification-management',
          title: 'Notification Management',
          type: 'item',
          url: '/notificationsmanage/notification-management'
        }
      ]
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'collapse',
      icon: icons.IconCategory2,
      children: [
        {
          id: 'category-list',
          title: 'List Category',
          type: 'item',
          url: '/categories/list-category'
        }
      ]
    },
    {
      id: 'users',
      title: 'Users',
      type: 'collapse',
      icon: icons.IconUser,
      children: [
        { id: 'user-list', title: 'User List', type: 'item', url: '/users/list' },
        { id: 'user-add', title: 'Add User', type: 'item', url: '/users/add' }
      ]
    },
    {
      id: 'orders',
      title: 'Orders',
      type: 'collapse',
      icon: icons.IconShoppingCart,
      children: [{ id: 'order-list', title: 'Order List', type: 'item', url: '/orders/list' }]
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      type: 'collapse',
      icon: icons.IconSettings,
      children: [
        {
          id: 'profile',
          title: 'Profile',
          type: 'item',
          url: '/account/profile'
        }
      ]
    }
  ]
};

export default pages;

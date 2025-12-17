// assets
import {
  IconBell,
  IconCategory2,
  IconKey,
  IconMenu,
  IconPackage,
  IconPhoto,
  IconSettings,
  IconShoppingCart,
  IconTable,
  IconTag,
  IconTicket,
  IconUser
} from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconMenu,
  IconCategory2,
  IconUser,
  IconTable,
  IconShoppingCart,
  IconSettings,
  IconPackage,
  IconPhoto,
  IconBell,
  IconTicket,
  IconTag
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
        },
        {
          id: 'manage-tags',
          title: 'Manage Tags',
          type: 'item',
          url: '/menu/manage-tags'
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
      id: 'combos',
      title: 'Combo',
      type: 'collapse',
      icon: icons.IconPackage,
      children: [
        {
          id: 'combo-list',
          title: 'List Combo',
          type: 'item',
          url: '/combos/list-combo'
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
          id: 'table-management',
          title: 'Table Management',
          type: 'item',
          url: '/tables/management'
        },
        {
          id: 'booking-management',
          title: 'Booking Management',
          type: 'item',
          url: '/place-table/bookings'
        }
      ]
    },
    {
      id: 'banner',
      title: 'Banner Management',
      type: 'collapse',
      icon: icons.IconPhoto,
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
      icon: icons.IconBell,
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
      id: 'vouchers',
      title: 'Vouchers',
      type: 'collapse',
      icon: icons.IconTicket,
      children: [
        {
          id: 'voucher-management',
          title: 'Voucher Management',
          type: 'item',
          url: '/vouchers/management'
        }
      ]
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

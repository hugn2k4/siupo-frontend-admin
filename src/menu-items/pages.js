// assets
import { IconKey, IconMenu, IconShoppingCart, IconTable, IconUser } from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconMenu,
  IconUser,
  IconTable,
  IconShoppingCart
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
          title: 'Menu List',
          type: 'item',
          url: '/menu/list'
        },
        {
          id: 'menu-add',
          title: 'Add New Menu',
          type: 'item',
          url: '/menu/add'
        },
        {
          id: 'menu-category',
          title: 'Manage Categories',
          type: 'item',
          url: '/menu/category'
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
      id: 'reservations',
      title: 'Table Reservations',
      type: 'collapse',
      icon: icons.IconTable,
      children: [
        { id: 'reservation-list', title: 'Reservation List', type: 'item', url: '/reservations/list' },
        { id: 'reservation-add', title: 'Add Reservation', type: 'item', url: '/reservations/add' }
      ]
    },
    {
      id: 'orders',
      title: 'Orders',
      type: 'collapse',
      icon: icons.IconShoppingCart,
      children: [
        { id: 'order-list', title: 'Order List', type: 'item', url: '/orders/list' },
        { id: 'order-returns', title: 'Returns / Refunds', type: 'item', url: '/orders/returns' }
      ]
    }
  ]
};

export default pages;

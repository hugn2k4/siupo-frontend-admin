import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from './PrivateRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// menu list routing
const ListFood = Loadable(lazy(() => import('views/pages/menu/ListFood')));
const ManageTags = Loadable(lazy(() => import('views/pages/menu/ManageTags')));

// combo list routing
const ListCombo = Loadable(lazy(() => import('views/pages/combo/ListCombo')));

// category list routing
const ListCategory = Loadable(lazy(() => import('views/pages/category/ListCategory')));

//
const AccountProfile = Loadable(lazy(() => import('views/pages/account/Profile')));
// order table routing
const BookingManagement = Loadable(lazy(() => import('views/pages/place-table/BookingManagement')));
const TableManagement = Loadable(lazy(() => import('views/pages/tables/TableManagement')));
const NotificationManagement = Loadable(lazy(() => import('views/pages/notificationsmanage/NotificationManagement')));
const BannerManagement = Loadable(lazy(() => import('views/pages/banner/BannerManagement')));
const UserList = Loadable(lazy(() => import('views/pages/users/UserList')));

// orders routing
const OrderList = Loadable(lazy(() => import('views/pages/orders/OrderList')));

// vouchers routing
const VoucherManagement = Loadable(lazy(() => import('views/pages/vouchers/VoucherManagement')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'menu',
      children: [
        {
          path: 'list-food',
          element: <ListFood />
        },
        {
          path: 'manage-tags',
          element: <ManageTags />
        }
      ]
    },
    {
      path: 'combos',
      children: [
        {
          path: 'list-combo',
          element: <ListCombo />
        }
      ]
    },
    {
      path: 'tables',
      children: [
        {
          path: 'management',
          element: <TableManagement />
        }
      ]
    },
    {
      path: 'place-table',
      children: [
        {
          path: 'bookings',
          element: <BookingManagement />
        }
      ]
    },
    {
      path: 'banner',
      children: [
        {
          path: 'banner-management',
          element: <BannerManagement />
        }
      ]
    },
    {
      path: 'categories',
      children: [
        {
          path: 'list-category',
          element: <ListCategory />
        }
      ]
    },
    {
      path: 'notificationsmanage',
      children: [
        {
          path: 'notification-management',
          element: <NotificationManagement />
        }
      ]
    },
    {
      path: 'account',
      children: [
        {
          path: 'profile',
          element: <AccountProfile />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: 'users',
      children: [
        {
          path: 'list',
          element: <UserList />
        }
      ]
    },
    {
      path: 'orders',
      children: [
        {
          path: 'list',
          element: <OrderList />
        }
      ]
    },
    {
      path: 'vouchers',
      children: [
        {
          path: 'management',
          element: <VoucherManagement />
        }
      ]
    }
  ]
};

export default MainRoutes;

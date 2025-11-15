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

// category list routing
const ListCategory = Loadable(lazy(() => import('views/pages/category/ListCategory')));

//
const AccountProfile = Loadable(lazy(() => import('views/pages/account/Profile')));
// order table routing
const PlaceTableGuest = Loadable(lazy(() => import('views/pages/place-table/GuestBookingManagement')));
const PlaceTableCustomer = Loadable(lazy(() => import('views/pages/place-table/CustomerBookingManagement')));
const NotificationManagement = Loadable(lazy(() => import('views/pages/notificationsmanage/NotificationManagement')));
const BannerManagement = Loadable(lazy(() => import('views/pages/banner/BannerManagement')));
const UserList = Loadable(lazy(() => import('views/pages/users/UserList')));
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
        }
      ]
    },
    {
      path: 'place-table',
      children: [
        {
          path: 'place-table-for-guest',
          element: <PlaceTableGuest />
        },
        {
          path: 'place-table-for-customer',
          element: <PlaceTableCustomer />
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
    }
  ]
};

export default MainRoutes;

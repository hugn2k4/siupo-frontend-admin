import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

import AuthHandlerInitializer from 'components/AuthHandlerInitializer';
import { GlobalProvider } from 'contexts/GlobalProvider';
import { SnackbarProvider } from 'contexts/SnackbarProvider';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <SnackbarProvider>
          <GlobalProvider>
            <AuthHandlerInitializer>
              <RouterProvider router={router} />
            </AuthHandlerInitializer>
          </GlobalProvider>
        </SnackbarProvider>
      </NavigationScroll>
    </ThemeCustomization>
  );
}

import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { MapPage } from '@/pages/MapPage';
import { CameraWallPage } from '@/pages/CameraWallPage';
import { CameraManagementPage } from '@/pages/CameraManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MapPage /> },
      { path: 'wall', element: <CameraWallPage /> },
      { path: 'ams', element: <CameraManagementPage /> },
    ],
  },
]);

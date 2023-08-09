import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

import Root from './routes/root';
import Index from './routes';

import './index.scss';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <div>Error in page!</div>,
    children: [
      {
        index: true,
        element: <Index />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

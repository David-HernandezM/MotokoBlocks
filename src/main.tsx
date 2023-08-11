import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

import Root from './routes/root';
import Index from './routes';
import User from './routes/user';
import Edit from './routes/edit';

// import { loader as userLoader } from './routes/user';

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
      },
      {
        path: "/user/:userPrincipal",
        element: <User />,
        // loader: userLoader,
        errorElement: <div>Error in page!</div>,
      },
      {
        path: "/user/:userPrincipal/edit",
        element: <Edit />,
        errorElement: <div>Error opening editor!</div>
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

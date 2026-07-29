import { createBrowserRouter, Navigate } from 'react-router';

// Login
import Login from '../pages/authentication/Login.jsx';
import ForgetPassword from '../pages/authentication/ForgetPassword.jsx';
import Logout from '../pages/authentication/Logout.jsx';
import Register from '../pages/authentication/Register.jsx';

// Layout
import NonAuthLayout from '../layouts/NonAuthLayout.jsx';
import AuthProtected from '../routes/AuthProtected.jsx';

// Pages
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Page404 from '../pages/page404/Page404.jsx';
import Layout from '../layouts/Layout.jsx';
import Tasks from '../pages/tasks/Tasks.jsx';
import TaskDetail from '../pages/tasks/TaskDetail.jsx';

const router = createBrowserRouter([
    {
        Component: NonAuthLayout,
        children: [
            { path: 'login', Component: Login },
            { path: 'logout', Component: Logout },
            { path: 'register', Component: Register },
            { path: 'forget-password', Component: ForgetPassword },
        ],
    },
    {
        Component: AuthProtected,
        children: [
            {
                Component: Layout,
                children: [
                    { path: '*', element: <Navigate to="/page404" /> },
                    { index: true, element: <Navigate to="/dashboard" /> },
                    { path: 'dashboard', Component: Dashboard },
                    { path: 'tasks', Component: Tasks },
                    { path: 'tasks/:id', Component: TaskDetail },
                    { path: 'page404', Component: Page404 },
                ],
            },
        ],
    },
]);

export default router;

import React from 'react';
import { Button } from './components/ui/button';
import { RouterProvider } from 'react-router';
import router from '@/routes/routes.jsx';

const App = () => {
    return (
        <React.Fragment>
            <RouterProvider router={router} />
        </React.Fragment>
    );
};

export default App;

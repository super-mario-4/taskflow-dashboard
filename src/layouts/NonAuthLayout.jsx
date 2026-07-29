import React from 'react';
import { Outlet } from 'react-router';

const NonAuthLayout = () => {
    return (
        <React.Fragment>
            <Outlet />
        </React.Fragment>
    );
};

export default NonAuthLayout;

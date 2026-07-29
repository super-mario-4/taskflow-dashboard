import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { useNavigate } from 'react-router';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        // Dispatch logout action
        dispatch(logout());
        
        // Redirect to login page
        navigate('/login');
    }, [dispatch, navigate]);

    return <React.Fragment></React.Fragment>;
};

export default Logout;

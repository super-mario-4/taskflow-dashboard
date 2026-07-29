import { createRoot } from 'react-dom/client';
import './assets/css/index.css';
import App from './App.jsx';
import { ThemeProvider } from '@/components/theme-provider.jsx';
import { Provider } from 'react-redux';
import store from './store';
import { TooltipProvider } from '@/components/ui/tooltip.jsx';

// Restore user state from localStorage on app start
const storedUser = localStorage.getItem('user');
if (storedUser) {
    const userData = JSON.parse(storedUser);
    // Dispatch action to set initial user state in Redux
    store.dispatch({
        type: 'auth/loginSuccess',
        payload: userData,
    });
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider>
        <Provider store={store}>
            <TooltipProvider>
                <App />
            </TooltipProvider>
        </Provider>
    </ThemeProvider>
);

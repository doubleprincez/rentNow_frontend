'use client'
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { AlertProvider } from '@/contexts/AlertContext';
import SessionChecker from '@/components/SessionChecker';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AlertProvider>
                <SessionChecker />
                {children}
            </AlertProvider>
        </Provider>
    );
};

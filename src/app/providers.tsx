'use client'
import { Provider } from 'react-redux';
import { store, persistor } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { AlertProvider } from '@/contexts/AlertContext';
import { PersistLogin } from '@/components/custom/PersistLogin';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistLogin />
            <PersistGate loading={null} persistor={persistor}>
                <AlertProvider>
                    {children}
                </AlertProvider>
            </PersistGate>
        </Provider>
    );
};
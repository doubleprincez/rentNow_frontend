'use client'
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { AlertProvider } from '@/contexts/AlertContext';
import { PersistLogin } from '@/components/custom/PersistLogin';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        <PersistLogin />
        <AlertProvider>
            {children}
        </AlertProvider>
    </Provider>
  );
}
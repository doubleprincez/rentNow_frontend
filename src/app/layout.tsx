'use client'
import "./globals.css";
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { metadata } from './metadata'
import { AlertProvider } from '@/contexts/AlertContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{typeof metadata.title === 'string' ? metadata.title : 'RentNaija'}</title>
        <meta
          name="description"
          content={metadata.description || 'Online apartment leasing agency'}
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`w-full flex flex-col`} >
        <div className="">
          <Provider store={store}>
            <AlertProvider>
              {children}
            </AlertProvider>
          </Provider>
        </div>
      </body>
    </html>
  );
}

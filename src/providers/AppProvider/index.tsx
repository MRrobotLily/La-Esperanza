import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '../QueryProvider';
import AuthProvider from '../AuthProvider';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AppProvider({ children }: Props) {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3200,
              style: {
                background: '#1B4332',
                color: '#fff',
                borderRadius: '12px',
                fontFamily: '"DM Sans", system-ui',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

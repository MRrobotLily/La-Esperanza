import Header from '../Header';
import BottomNav from '../BottomNav';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sinBottomNav?: boolean;
}

export default function Page({ children, sinBottomNav }: Props) {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pb-10">
        {children}
      </main>
      {!sinBottomNav && <BottomNav />}
    </div>
  );
}

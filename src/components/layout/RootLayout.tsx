import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from './Header';
import { useMapStore } from '@/stores/useMapStore';

export function RootLayout() {
  const theme = useMapStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground animate-fade-in">
        <Header />
        <main className="flex-1 w-full h-full relative overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

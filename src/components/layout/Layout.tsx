import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Drawer from '@/components/layout/Drawer';
import { Toast } from '@/components/ui/Feedback';

interface LayoutProps {
  title?: string;
  hideFooter?: boolean;
  children: ReactNode;
}

export default function Layout({ title, hideFooter, children }: LayoutProps) {
  const { pathname, search } = useLocation();

  /** 더보기(page)만 바뀐 경우에는 현재 위치를 유지한다 */
  const scrollKey = (() => {
    const params = new URLSearchParams(search);
    params.delete('page');
    return `${pathname}?${params.toString()}`;
  })();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [scrollKey]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={title} />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <Drawer />
      <Toast />
    </div>
  );
}

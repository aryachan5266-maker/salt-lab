import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { StoreProvider, ToastProvider } from '@/components/store';

export const metadata: Metadata = {
  title: '咸聊AI · 小红书内容中台',
  description:
    '从选题挖掘到发布复盘的完整闭环，为女性创业者/商业认知博主打造。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <StoreProvider>
          <ToastProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex min-h-screen flex-1 flex-col">
                <Topbar />
                <main className="flex-1 px-6 py-6">{children}</main>
              </div>
            </div>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

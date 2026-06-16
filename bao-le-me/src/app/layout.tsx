import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '爆了么 — 编导脑卡位引擎',
  description: '不做第三个数据看板，只做最稀缺的——告诉你该拍什么、为什么火、怎么不撞车。by nacl',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[var(--color-bg)]">
        {children}
      </body>
    </html>
  );
}

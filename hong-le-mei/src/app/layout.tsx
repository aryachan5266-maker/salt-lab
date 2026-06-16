import type { Metadata } from 'next';
import { StoreProvider, ToastProvider } from '@/components/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'NΛCL | AI 营销结果工具',
  description:
    '选角色 + 说一句话，一键产出可直接发布的笔记 + 预览图 + 营销逻辑。连接一切·构建未来。',
  keywords: [
    'NΛCL',
    'AI营销',
    '小红书文案',
    '抖音脚本',
    'AI生图',
    '营销工具',
    '内容创作',
  ],
  authors: [{ name: 'NΛCL' }],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <StoreProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </StoreProvider>
        {/* 扫描线 overlay */}
        <div className="scanline-overlay" />
      </body>
    </html>
  );
}

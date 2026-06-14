import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '咸聊 AI | 全行业 AI 营销结果工具',
  description:
    '用一句话或选个角色，一键产出可直接发布的笔记 + 已发布态预览图 + 营销逻辑说明。全行业通用，不只是文案工具。',
  keywords: [
    '咸聊AI',
    'AI营销',
    '小红书文案',
    '抖音脚本',
    'AI生图',
    '营销工具',
    '内容创作',
  ],
  authors: [{ name: 'XIANLIAO AI' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        {children}
        {/* 扫描线 overlay */}
        <div className="scanline-overlay" />
      </body>
    </html>
  );
}

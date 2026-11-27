import React from 'react';
import DesktopOnlyGuard from '@/app/DesktopOnlyGuard';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopOnlyGuard>{children}</DesktopOnlyGuard>;
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DialogTerbukaMenu from "../../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/2_dialog_terbuka/DialogTerbukaMenu";

function ForumDialogTerbukaContent() {
  const searchParams = useSearchParams();
  const country = searchParams.get('country');
  const returnHref = country
    ? `/page/map_system?country=${encodeURIComponent(country)}`
    : "/page/map_system";

  return <DialogTerbukaMenu returnHref={returnHref} />;
}

export default function ForumDialogTerbukaPage() {
  return (
    <Suspense fallback={null}>
      <ForumDialogTerbukaContent />
    </Suspense>
  );
}

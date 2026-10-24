import DialogTerbukaMenu from "../../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/2_dialog_terbuka/DialogTerbukaMenu";

interface ForumDialogTerbukaPageProps {
  searchParams: Promise<{ country?: string }>;
}

export default async function ForumDialogTerbukaPage({
  searchParams,
}: ForumDialogTerbukaPageProps) {
  const { country } = await searchParams;
  const returnHref = country
    ? `/page/map_system?country=${encodeURIComponent(country)}`
    : "/page/map_system";

  return <DialogTerbukaMenu returnHref={returnHref} />;
}

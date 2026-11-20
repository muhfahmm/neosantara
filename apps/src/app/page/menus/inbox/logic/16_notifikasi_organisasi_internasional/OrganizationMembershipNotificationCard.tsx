import { CheckCircle2, XCircle } from "lucide-react";
import { OrganizationMembershipNotification } from "./organizationMembershipNotificationLogic";
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface OrganizationMembershipNotificationCardProps {
  notification: OrganizationMembershipNotification;
}

export default function OrganizationMembershipNotificationCard({
  notification,
}: OrganizationMembershipNotificationCardProps) {
  const { t } = useLanguage();
  const isAccepted = notification.outcome === "accepted";

  return (
    <div
      className={`border border-l-4 ${
        isAccepted
          ? "border-emerald-500/40 border-l-emerald-500 bg-emerald-950/30"
          : "border-rose-500/40 border-l-rose-500 bg-rose-950/25"
      } flex items-start gap-4 rounded-r-2xl p-4 shadow-lg sm:p-5`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
          isAccepted
            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
            : "border-rose-500/40 bg-rose-500/20 text-rose-400"
        }`}
      >
        {isAccepted ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black uppercase leading-tight tracking-wide text-white">
            {notification.title}
          </h4>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
              isAccepted
                ? "border-emerald-500/40 bg-emerald-900/60 text-emerald-300"
                : "border-rose-500/40 bg-rose-900/50 text-rose-300"
            }`}
          >
            {notification.category} · {isAccepted ? (t('side_inbox.actions.accept') || "Diterima") : (t('side_inbox.actions.reject') || "Ditolak")}
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {notification.countryName} · {notification.organizationName} · {notification.timestamp}
        </p>
        <p className="text-xs font-medium leading-relaxed text-slate-200">{notification.message}</p>
      </div>
    </div>
  );
}

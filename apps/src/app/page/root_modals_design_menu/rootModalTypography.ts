export const rootModalTypography = {
  title: "text-[length:var(--modal-font-title)] font-bold uppercase tracking-tight text-root-text",
  sectionTitle: "text-[length:var(--modal-font-section-title)] font-bold uppercase tracking-wider text-root-accent",
  label: "text-[length:var(--modal-font-label)] font-bold uppercase tracking-wider text-root-muted",
  value: "text-[length:var(--modal-font-value)] font-semibold text-root-text",
  metricValue: "text-base sm:text-lg font-black font-mono tabular-nums tracking-tight text-root-text",
  tab: "text-[length:var(--modal-font-tab,0.75rem)] font-bold uppercase tracking-widest",
  body: "text-[length:var(--modal-font-body)] font-medium leading-relaxed text-root-body",
  badge: "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
  muted: "text-root-muted",
} as const;
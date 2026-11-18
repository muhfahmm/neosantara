"use client";

import React, { ElementType } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "./RootModalCloseButton";

export type RootAISuggestionStatus = "deficit" | "surplus" | "neutral";

interface RootAISuggestionsButtonProps {
  onClick: () => void;
  title: string;
  status?: RootAISuggestionStatus;
}

export function RootAISuggestionsButton({
  onClick,
  title,
  status = "neutral",
}: RootAISuggestionsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`root-ai-trigger root-ai-trigger--${status}`}
      title={title}
      aria-label={title}
    >
      <span className="root-ai-trigger__icon">
        <MessageSquare className="h-5 w-5" aria-hidden="true" />
        <span className="root-ai-trigger__status" />
      </span>
      <span>AI</span>
    </button>
  );
}

export interface RootAISuggestionMetric {
  label: string;
  value: string;
  tone?: RootAISuggestionStatus;
  progress?: number;
}

export interface RootAISuggestionItem {
  key: string;
  label: string;
  status: RootAISuggestionStatus;
  value?: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
  navigationLabel?: string;
  onNavigate?: () => void;
}

interface RootAISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorLabel: string;
  title?: string;
  subtitle?: string;
  sectionTitle: string;
  icon?: ElementType<{ className?: string }>;
  metrics: RootAISuggestionMetric[];
  items: RootAISuggestionItem[];
  summary?: string;
  summaryTitle?: string;
}

export default function RootAISuggestionsModal({
  isOpen,
  onClose,
  sectorLabel,
  title,
  subtitle = "Evaluasi kebutuhan dan kondisi sektor",
  sectionTitle,
  icon: HeaderIcon = Sparkles,
  metrics,
  items,
  summary,
  summaryTitle = "Ringkasan AI",
}: RootAISuggestionsModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[75]">
      <div className="root-ai-modal">
        <header className="root-ai-modal__header">
          <div className="root-ai-modal__heading">
            <span className="root-ai-modal__icon">
              <HeaderIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="root-ai-modal__title">
                {title || `Rekomendasi & Analisis AI Sektor ${sectorLabel}`}
              </h2>
              <p className="root-ai-modal__subtitle">{subtitle}</p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </header>

        <div className="root-ai-modal__body neon-scrollbar">
          <div className="root-ai-modal__metrics">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`root-ai-modal__metric root-ai-modal__metric--${metric.tone || "neutral"}`}
              >
                <span className="root-ai-modal__metric-label">{metric.label}</span>
                <strong className="root-ai-modal__metric-value">{metric.value}</strong>
                {metric.progress !== undefined && (
                  <div
                    className="root-ai-modal__progress"
                    role="progressbar"
                    aria-label={metric.label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(100, Math.max(0, metric.progress))}
                  >
                    <span style={{ width: `${Math.min(100, Math.max(0, metric.progress))}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <section className="root-ai-modal__section">
            <div className="root-ai-modal__section-heading">
              <h3>{sectionTitle}</h3>
              <span>{items.length} item</span>
            </div>

            <div className="root-ai-modal__list">
              {items.map((item) => {
                const StatusIcon = item.status === "deficit" ? AlertCircle : CheckCircle2;

                return (
                  <article
                    key={item.key}
                    className={`root-ai-modal__item root-ai-modal__item--${item.status}`}
                  >
                    <div className="root-ai-modal__item-main">
                      <StatusIcon className="root-ai-modal__status-icon" aria-hidden="true" />
                      <div className="root-ai-modal__item-copy">
                        <strong>{item.label}</strong>
                        {item.details && <span>{item.details}</span>}
                      </div>
                    </div>

                    <div className="root-ai-modal__item-side">
                      {item.value && <span className="root-ai-modal__item-value">{item.value}</span>}
                      <div className="root-ai-modal__actions">
                        {item.onAction && item.actionLabel && (
                          <button
                            type="button"
                            onClick={item.onAction}
                            className="root-ai-modal__action"
                          >
                            {item.actionLabel}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.onNavigate && (
                          <button
                            type="button"
                            onClick={item.onNavigate}
                            className="root-ai-modal__navigate"
                            aria-label={item.navigationLabel || `Buka ${item.label}`}
                            title={item.navigationLabel || `Buka ${item.label}`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Ringkasan AI ditiadakan sesuai konfigurasi visual */}
        </div>
      </div>
    </NotebookModalWrapper>
  );
}

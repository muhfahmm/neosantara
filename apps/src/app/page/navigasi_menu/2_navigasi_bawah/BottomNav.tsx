"use client"

import { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import { menuItems, subMenuItems } from "../navigationData";
import { useViewportMode } from "@/app/hooks/useViewportMode";

interface BottomNavProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  countryDetail?: any;
  isDetailModalOpen?: boolean;
  isAttackerForcesModalOpen?: boolean;
}

export default function BottomNav({
  activeMenu,
  setActiveMenu,
  countryDetail,
  isDetailModalOpen = false,
  isAttackerForcesModalOpen = false,
}: BottomNavProps) {
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);

  useEffect(() => {
    const handleHide = () => setIsTemporarilyHidden(true);
    const handleShow = () => setIsTemporarilyHidden(false);

    window.addEventListener('hide_strategy_modal', handleHide);
    window.addEventListener('show_strategy_modal', handleShow);

    return () => {
      window.removeEventListener('hide_strategy_modal', handleHide);
      window.removeEventListener('show_strategy_modal', handleShow);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  // Sync activeTab with activeMenu for external changes
  useEffect(() => {
    if (activeMenu === "") {
      setActiveTab(null);
    } else if (activeMenu === "Peta Taktis") {
      setActiveTab(null);
    } else {
      // Check if activeMenu is a group itself (Step Back state)
      if (subMenuItems[activeMenu]) {
        setActiveTab(activeMenu);
      } else {
        // Check if activeMenu is a sub-item
        for (const [mainId, subs] of Object.entries(subMenuItems)) {
          if (subs.some((s: any) => activeMenu.startsWith(s.id))) {
            setActiveTab(mainId);
            break;
          }
        }
      }
    }
  }, [activeMenu]);

  const handleMainClick = (id: string) => {
    if (activeTab === id) {
      setActiveTab(null);
      setActiveMenu("Peta Taktis");
    } else {
      setActiveTab(id);
      setActiveMenu(id);
    }
  };

  const handleFullReset = () => {
    setActiveTab(null);
    setActiveMenu("Peta Taktis");
  };

  const isMenuSelected = activeTab !== null;
  const currentSubItems = activeTab ? subMenuItems[activeTab] : [];

  const isMainCategory = menuItems.some(item => item.id === activeMenu);
  const isSubMenuItem = Object.values(subMenuItems).flat().some((sub: any) => activeMenu.startsWith(sub.id));

  const isOtherModalOpen = activeMenu !== "" &&
                           activeMenu !== "Peta Taktis" &&
                           !isMainCategory &&
                           !isSubMenuItem &&
                           !activeMenu.startsWith("Menu:KomandoPertahanan");

  // Hide navigation completely while an overlay menu is open.
  if (isTemporarilyHidden || isDetailModalOpen || isAttackerForcesModalOpen || isSubMenuItem || isOtherModalOpen) return null;

  return (
    <div
      style={{
        bottom: isMobile
          ? 'calc(var(--safe-bottom) + 0.35rem)'
          : 'calc(var(--safe-bottom) + var(--bottom-nav-desktop-offset, 0.35rem))',
      }}
      className={`fixed left-1/2 z-[200] w-max max-w-[95vw] -translate-x-1/2 pointer-events-none transition-transform duration-300 ${
        isLandscapePhone
          ? 'max-w-[calc(100vw-1rem)]'
          : ''
      }`}
    >
      <nav
        aria-label="Navigasi menu utama"
        className={`root-bottom-nav pointer-events-auto flex w-max max-w-full flex-wrap items-center border border-root-accent/30 bg-root-surface/95 backdrop-blur-md transition-[background-color,box-shadow] duration-200 ${
          isLandscapePhone
            ? 'gap-0.5 rounded-md p-0.5'
            : isPortraitPhone
            ? 'gap-1 rounded-lg p-1.5'
            : 'gap-1.5 rounded-2xl p-1.5 lg:p-2'
        }`}
      >
        {/* Main Navigation Section */}
        <div className={`flex min-w-0 flex-wrap items-center ${isLandscapePhone ? 'gap-0.5' : 'gap-1'}`}>
          {(isMenuSelected
            ? [
                { id: "Peta Taktis", icon: LayoutGrid, label: "Peta Taktis" },
                menuItems.find(item => item.id === activeTab),
              ]
            : menuItems
          ).filter(Boolean).map((item: any) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isMap = item.id === "Peta Taktis";
            const hasSubItems = Boolean(subMenuItems[item.id]?.length);

            return (
              <div key={item.id} className="group relative shrink-0">
                <button
                  data-tutorial={item.id === "Ekonomi" ? "menu-ekonomi" : item.id === "Pembangunan" ? "menu-pembangunan" : undefined}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={isActive}
                  aria-expanded={!isMap && hasSubItems ? isActive : undefined}
                  aria-controls={!isMap && isActive && hasSubItems ? "bottom-nav-submenu" : undefined}
                  onClick={() => isMap ? handleFullReset() : handleMainClick(item.id)}
                  className={`inline-flex shrink-0 cursor-pointer items-center justify-center border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent/60 ${
                    isLandscapePhone
                      ? 'min-h-[30px] gap-1 rounded-md px-1.5 py-1'
                      : isPortraitPhone
                      ? 'min-h-9 gap-2 rounded-lg px-2 py-1.5'
                      : 'min-h-10 gap-2 rounded-xl px-2.5 py-2'
                  } ${
                    isActive
                      ? "border-root-accent bg-root-accent text-root-accent-ink"
                      : "border-transparent text-root-muted hover:bg-root-accent/10 hover:text-root-text"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`shrink-0 ${isLandscapePhone ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
                  />
                  {isActive && !isMobile && (
                    <span className={`whitespace-nowrap font-black uppercase ${isLandscapePhone ? 'text-[8px] tracking-wide' : 'text-[10px] tracking-widest'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
                {!isActive && !isMobile && <Tooltip label={item.label} />}
              </div>
            );
          })}
        </div>

        {/* Vertical Divider */}
        {isMenuSelected && currentSubItems?.length > 0 && (
          <div
            aria-hidden="true"
            className={`w-px shrink-0 bg-root-accent/25 ${isLandscapePhone ? 'mx-0.5 h-5' : 'mx-1 h-7'}`}
          />
        )}

        {/* Sub-Menu Extension Section */}
        {isMenuSelected && currentSubItems?.length > 0 && (
          <div
            id="bottom-nav-submenu"
            role="group"
            aria-label={`Submenu ${activeTab}`}
            className={`flex min-w-0 flex-wrap items-center ${isLandscapePhone ? 'gap-0.5' : 'gap-1'}`}
          >
            {currentSubItems.map((sub: any) => (
              <div key={sub.id} className="relative group shrink-0">
                <button
                  type="button"
                  title={sub.label}
                  aria-label={sub.label}
                  onClick={() => setActiveMenu(sub.id)}
                  className={`inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent font-semibold text-root-text transition-colors hover:bg-root-accent/10 hover:text-root-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent/60 ${
                    isLandscapePhone
                      ? 'min-h-[30px] gap-1 rounded-md px-1.5 py-1 text-[9px]'
                      : isPortraitPhone
                      ? 'min-h-9 gap-2 rounded-lg px-2 py-1.5 text-[10px]'
                      : 'min-h-9 gap-2 rounded-xl px-3 py-2 text-[10px]'
                  }`}
                >
                  <sub.icon
                    aria-hidden="true"
                    className={`shrink-0 text-root-accent/80 ${isLandscapePhone ? 'h-3 w-3' : 'h-3.5 w-3.5'}`}
                  />
                  {!isMobile && (
                    <span className="whitespace-nowrap font-black uppercase tracking-wider">
                      {sub.label}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-[9999] mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-root-accent/30 bg-root-surface px-4 py-2.5 text-[13px] font-semibold text-root-text opacity-0 transition-opacity duration-150 group-hover:block group-hover:opacity-100"
    >
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-root-surface"></div>
    </div>
  );
}

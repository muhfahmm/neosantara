"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star, Wallet, Wrench, Shield, Globe, Landmark, LayoutGrid,
  Hammer, Swords as MilitaryIcon, Users2, BarChart3, TrendingUp,
  ArrowRightLeft, FileText, CreditCard, Zap, Package, Home, ShieldAlert, Gem, Tag, Smile, Eye, HeartHandshake, HandHelping, Handshake,
  Droplet, Activity, Bolt, Radiation, Info, Bug
} from "lucide-react";
import { menuItems, subMenuItems } from "../navigationData";
import { preloadModalForMenu } from "./modalPreloaders";

const modalPreloadPromises = new Map<string, Promise<unknown>>();
let modalsManagerPromise: Promise<typeof import("./ModalsManager")> | null = null;

function loadModalsManager() {
  if (!modalsManagerPromise) {
    modalsManagerPromise = import("./ModalsManager").catch(error => {
      modalsManagerPromise = null;
      throw error;
    });
  }
  return modalsManagerPromise;
}

function prefetchMenuModal(menuId: string) {
  if (modalPreloadPromises.has(menuId)) return;

  const preloadPromise = Promise.resolve(preloadModalForMenu(menuId));
  modalPreloadPromises.set(menuId, preloadPromise);
  void preloadPromise.catch(error => {
    modalPreloadPromises.delete(menuId);
    console.error(`BottomNav: failed to preload menu "${menuId}"`, error);
  });
}

function prefetchMenuGroup(menuId: string) {
  const menuOptions = subMenuItems[menuId] || [];
  menuOptions.forEach(menu => prefetchMenuModal(menu.id));
}

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
    const preload = () => {
      void loadModalsManager().catch(error => {
        console.error('BottomNav: failed to preload menu manager', error);
      });
    };

    const timeoutId = window.setTimeout(preload, 1000);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

  // 🔥 SINGLE unified hide check — placed BEFORE any render logic
  // Covers: notification modals (inbox/reward/news), detail modals, sub-menu modals, and strategy hide events
  if (isTemporarilyHidden || isDetailModalOpen || isAttackerForcesModalOpen || isSubMenuItem) return null;

  const isOtherModalOpen = activeMenu !== "" &&
                           activeMenu !== "Peta Taktis" &&
                           !isMainCategory &&
                           !isSubMenuItem &&
                           !activeMenu.startsWith("Menu:KomandoPertahanan");

  return (
    <div className={`absolute bottom-3 lg:bottom-4 xl:bottom-6 2xl:bottom-12 left-1/2 -translate-x-1/2 w-max max-w-[95vw] transition-all duration-500 cursor-not-allowed z-[200] ${isOtherModalOpen ? 'opacity-50' : 'opacity-100'
      }`}>
      <nav className="flex items-center gap-1 lg:gap-1.5 bg-[#0F2424]/90 backdrop-blur-md px-1.5 lg:px-2 py-1 lg:py-1.5 rounded-xl lg:rounded-2xl border border-[#00FFAA]/30 transition-all duration-500 ease-in-out overflow-visible">
        {/* Main Navigation Section */}
        <div className="flex items-center gap-0.5 lg:gap-1 2xl:gap-2">
          {(isMenuSelected
            ? [{ id: "Peta Taktis", icon: LayoutGrid, label: "Peta Taktis" }, menuItems.find(item => item.id === activeTab)]
            : menuItems
          ).filter(Boolean).map((item: any) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isMap = item.id === "Peta Taktis";

            return (
              <div key={item.id} className="group relative">
                <button
                  onFocus={() => {
                    if (!isActive && !isMap) prefetchMenuGroup(item.id);
                  }}
                  onPointerDown={() => {
                    if (!isActive && !isMap) prefetchMenuGroup(item.id);
                  }}
                  onClick={() => isMap ? handleFullReset() : handleMainClick(item.id)}
                  className={`px-2 py-1.5 lg:px-2.5 lg:py-2 2xl:px-4 2xl:py-3 rounded-lg xl:rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-1.5 lg:gap-2 2xl:gap-2.5 justify-center ${isActive
                    ? "bg-[#00FFAA] text-[#0A1A1A] font-bold border border-[#00FFAA]"
                    : "text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#00FFAA]/10"
                    }`}
                >
                  {item.image ? (
                    <span className="relative h-3.5 w-3.5 shrink-0 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5">
                      <Image
                        src={item.image}
                        alt=""
                        aria-hidden="true"
                        width={56}
                        height={56}
                        className="absolute left-1/2 top-1/2 h-8 w-8 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain lg:h-10 lg:w-10 2xl:h-12 2xl:w-12"
                      />
                    </span>
                  ) : (
                    <Icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 ${isActive ? "text-[#0A1A1A]" : ""}`} />
                  )}
                  {isActive && (
                    <span className="text-[9px] lg:text-[10px] 2xl:text-[11px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                  )}
                </button>
                {!isActive && <Tooltip label={item.label} />}
              </div>
            );
          })}
        </div>

        {/* Vertical Divider */}
        {isMenuSelected && currentSubItems?.length > 0 && (
          <div className="h-5 lg:h-6 2xl:h-8 w-[1px] bg-[#00FFAA]/30 mx-1 lg:mx-2 animate-in fade-in duration-500" />
        )}

        {/* Sub-Menu Extension Section */}
        {isMenuSelected && currentSubItems?.length > 0 && (
          <div className="flex items-center gap-1 lg:gap-1.5 animate-in slide-in-from-left-4 fade-in duration-500">
            {currentSubItems.map((sub: any) => (
              <div key={sub.id} className="relative group flex-shrink-0">
                <button
                  onPointerEnter={() => prefetchMenuModal(sub.id)}
                  onFocus={() => prefetchMenuModal(sub.id)}
                  onPointerDown={() => prefetchMenuModal(sub.id)}
                  onClick={() => setActiveMenu(sub.id)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center bg-transparent p-0 lg:h-[34px] lg:w-[34px] 2xl:h-[46px] 2xl:w-[46px]"
                >
                  {sub.image ? (
                    <span className="relative h-full w-full shrink-0">
                      <Image
                        src={sub.image}
                        alt=""
                        aria-hidden="true"
                        width={46}
                        height={46}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  ) : (
                    <sub.icon className="h-full w-full text-[#6B8A8A]" />
                  )}
                </button>
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-[#0F2424] border border-[#00FFAA]/30 text-[#E0E0E0] text-[13px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] scale-95 group-hover:scale-100`}>
                  {sub.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#0F2424]"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

function Tooltip({ label, small = false }: { label: string, small?: boolean }) {
  return (
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-[#0F2424] border border-[#00FFAA]/30 text-[#E0E0E0] text-[13px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] scale-95 group-hover:scale-100 group-hover:block`}>
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#0F2424]"></div>
    </div>
  );
}

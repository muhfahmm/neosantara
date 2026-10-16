'use client';

import React from 'react';

interface NotebookModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  ringCount?: number;
  maxWidthClass?: string;
  zIndexClass?: string;
}

export function NotebookModalWrapper({
  children,
  onClose,
  ringCount = 11,
  maxWidthClass = 'max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl',
  zIndexClass = 'z-[60]',
}: NotebookModalWrapperProps) {
  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent font-sans pointer-events-none`}
    >
      {/* Notebook Outer Frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full ${maxWidthClass} h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] shadow-2xl relative flex flex-col p-3 sm:p-4 pl-10 sm:pl-12 pointer-events-auto overflow-hidden`}
      >
        {/* Silver Binder Spine on the Left */}
        <div className="absolute left-3 sm:left-3.5 top-6 bottom-6 w-2 sm:w-2.5 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
        <div className="absolute left-[8px] sm:left-[10px] top-[24px] w-[16px] sm:w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
        <div className="absolute left-[8px] sm:left-[10px] bottom-[24px] w-[16px] sm:w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />

        {/* Notebook Rings binding the paper */}
        <div className="absolute left-[22px] sm:left-[26px] top-10 bottom-10 flex flex-col justify-between items-center py-4 pointer-events-none z-30">
          {[...Array(ringCount)].map((_, i) => (
            <div
              key={i}
              className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
            </div>
          ))}
        </div>

        {/* Main Panel Sheet — Green Theme */}
        <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative flex flex-col overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

          {/* Render Actual Modal Children */}
          <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotebookModalWrapper;

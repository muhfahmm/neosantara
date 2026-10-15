"use client";

import { useEffect } from "react";

export default function SecurityProtector() {
  useEffect(() => {
    // 1. Disable Context Menu (Klik Kanan)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Inspect Element & DevTools Shortcut Keys
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toUpperCase();

        // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
        // Ctrl+Shift+J / Cmd+Option+J (Console)
        // Ctrl+Shift+C / Cmd+Option+C (Inspect Element target)
        if (e.shiftKey && (key === "I" || key === "J" || key === "C")) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Ctrl+U (View Page Source)
        // Ctrl+S (Save Page)
        if (key === "U" || key === "S") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // 3. Disable Dragging of Images / Elements
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "IMG" || target?.tagName === "A") {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
    };
  }, []);

  return null;
}

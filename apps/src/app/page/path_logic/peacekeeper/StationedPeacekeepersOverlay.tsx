"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getMapScreenPos } from "../path-war";
import {
  loadStationedPeacekeepers,
  PEACEKEEPER_UPDATED_EVENT,
  type StationedPeacekeeper,
} from "./peacekeeperLogic";

export default function StationedPeacekeepersOverlay() {
  const [peacekeepers, setPeacekeepers] = useState<StationedPeacekeeper[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tankGroupsRef = useRef<Map<string, SVGGElement>>(new Map());

  // Muat data awal dan dengarkan pembaruan
  useEffect(() => {
    // Bersihkan storage tersimpan lama jika ada agar saat refresh benar-benar hilang/reset
    try {
      localStorage.removeItem("neosantara_stationed_peacekeepers");
    } catch {}

    setPeacekeepers(loadStationedPeacekeepers());

    const handleUpdate = () => {
      setPeacekeepers(loadStationedPeacekeepers());
    };

    window.addEventListener(PEACEKEEPER_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(PEACEKEEPER_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  // Update langsung transform DOM setiap frame (60fps sinkron dengan WASM engine peta)
  useEffect(() => {
    let rafId: number | null = null;
    let isActive = true;

    const updatePositions = () => {
      if (!isActive) return;
      for (const pk of peacekeepers) {
        const el = tankGroupsRef.current.get(pk.id);
        if (!el) continue;
        const pos = getMapScreenPos(pk.lat, pk.lng);
        if (!pos || (pos.x === 0 && pos.y === 0)) {
          el.style.display = "none";
        } else {
          el.style.display = "";
          el.setAttribute("transform", `translate(${pos.x} ${pos.y})`);
        }
      }
      rafId = requestAnimationFrame(updatePositions);
    };

    rafId = requestAnimationFrame(updatePositions);

    return () => {
      isActive = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [peacekeepers]);

  if (peacekeepers.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden font-sans select-none"
      style={{ clipPath: "inset(5rem 0 0 0)" }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="un-blue-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {peacekeepers.map((pk) => {
          const screenPos = getMapScreenPos(pk.lat, pk.lng);

          return (
            <g
              key={pk.id}
              ref={(node) => {
                if (node) {
                  tankGroupsRef.current.set(pk.id, node);
                } else {
                  tankGroupsRef.current.delete(pk.id);
                }
              }}
              transform={`translate(${screenPos?.x ?? 0} ${screenPos?.y ?? 0})`}
              className="pointer-events-auto cursor-help"
            >
              <title>
                {`Pasukan Penjaga Perdamaian (PBB / Sekutu)\nLokasi: ${pk.capital}, ${pk.allyCountry}\nKekuatan Tempur: ${new Intl.NumberFormat().format(pk.power)}`}
              </title>

              {/* Aura Penjaga Perdamaian (Biru Muda PBB) */}
              <circle r={36} fill="#38BDF8" opacity={0.12} />
              <circle r={22} fill="#38BDF8" opacity={0.22} filter="url(#un-blue-glow)" />

              {/* Animasi Radar / Guard Pulse */}
              <circle r={18} fill="none" stroke="#38BDF8" strokeWidth={1.5} opacity={0.8}>
                <animate attributeName="r" values="16;38;16" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* SVG Tank Penjaga Perdamaian PBB (Biru Muda PBB #38BDF8) */}
              <g transform="scale(0.85)">
                {/* Bayangan */}
                <ellipse cx={1} cy={3} rx={27} ry={15} fill="#000000" opacity={0.4} />

                {/* Rantai Roda (Tracks) */}
                <rect x={-21} y={-13} width={42} height={6.5} rx={2} fill="#082F49" />
                <rect x={-21} y={-13} width={42} height={1.8} rx={0.9} fill="#0369A1" />
                <rect x={-21} y={6.5} width={42} height={6.5} rx={2} fill="#082F49" />
                <rect x={-21} y={6.5} width={42} height={1.8} rx={0.9} fill="#0369A1" />

                {/* Badan Tank (Hull) */}
                <path
                  d="M-21,-6 L-19,-6.5 L18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L-19,6.5 L-21,6 Z"
                  fill="#38BDF8"
                  stroke="#075985"
                  strokeWidth={0.9}
                />
                <ellipse cx={-2} cy={0} rx={10.5} ry={7} fill="#0284C7" />

                {/* Turret */}
                <path
                  d="M-10,-4 L6,-4.5 L9,-2 L9,2 L6,4.5 L-10,4 L-12,2 L-12,-2 Z"
                  fill="#38BDF8"
                  stroke="#075985"
                  strokeWidth={0.7}
                />
                <circle cx={-5} cy={-1} r={2.2} fill="#0284C7" stroke="#075985" strokeWidth={0.5} />
                <circle cx={-5} cy={-1} r={1.1} fill="#BAE6FD" opacity={0.7} />

                {/* Mantlet & Laras */}
                <rect x={8} y={-2.5} width={4} height={5} rx={1} fill="#0369A1" stroke="#075985" strokeWidth={0.5} />
                <rect x={11} y={-1.3} width={18} height={2.6} fill="#0284C7" />
                <rect x={11} y={-1.3} width={18} height={0.9} fill="#BAE6FD" opacity={0.6} />
                <rect x={29} y={-2} width={4} height={4} rx={0.8} fill="#082F49" stroke="#075985" strokeWidth={0.4} />
              </g>

              {/* Label Badge "PBB" Kecil di Bawah Tank */}
              <g transform="translate(0, 18)">
                <rect
                  x={-16}
                  y={-6}
                  width={32}
                  height={12}
                  rx={3}
                  fill="#0369A1"
                  stroke="#38BDF8"
                  strokeWidth={0.8}
                  opacity={0.95}
                />
                <text
                  x={0}
                  y={3}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="900"
                  letterSpacing="0.08em"
                >
                  PBB
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

// ── Dây cờ ──────────────────────────────────────────────────────
const FLAG_COLORS = ["#8B1A1A", "#C41E3A", "#F5E6D0", "#D4A017", "#8B4513"];

function FlagString({ side }: { side: "left" | "right" }) {
  const flags = Array.from({ length: 8 });

  return (
    <div
      className={`fixed top-0 ${side === "left" ? "left-0" : "right-0"} pointer-events-none`}
      style={{ width: "200px", height: "120px", zIndex: 9999 }}
    >
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path
          d={
            side === "left" ? "M 0 0 Q 100 40 200 20" : "M 0 20 Q 100 40 200 0"
          }
          fill="none"
          stroke="#8B1A1A"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {flags.map((_, i) => {
          const x = (i / 7) * 200;
          const yOnCurve =
            Math.sin((i / 7) * Math.PI) * 30 + (i < 4 ? i * 3 : (7 - i) * 3);
          const color = FLAG_COLORS[i % FLAG_COLORS.length];

          return (
            <g key={i}>
              <polygon
                points={`${x - 8},${yOnCurve} ${x + 8},${yOnCurve} ${x},${yOnCurve + 18}`}
                fill={color}
                opacity="0.85"
                style={{
                  transformOrigin: `${x}px ${yOnCurve}px`,
                  animation: `flag-sway ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Hoa rơi ──────────────────────────────────────────────────────
const PETAL_TYPES = ["petal", "dot", "star"] as const;
type PetalType = (typeof PETAL_TYPES)[number];

interface Petal {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  type: PetalType;
}

const PETAL_COLORS = ["#C41E3A", "#E8A0A0", "#F5C5C5", "#D4A017", "#8B1A1A"];

const PETALS: Petal[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: Math.random() * 8 + 6,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 10,
  color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  type: PETAL_TYPES[Math.floor(Math.random() * 3)],
}));

function FallingPetals() {
  return (
    <>
      {PETALS.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: `${petal.x}%`,
            width: petal.size,
            height: petal.size,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          {petal.type === "petal" && (
            <svg viewBox="0 0 20 20" width={petal.size} height={petal.size}>
              <ellipse
                cx="10"
                cy="10"
                rx="6"
                ry="10"
                fill={petal.color}
                opacity="0.7"
                transform="rotate(45 10 10)"
              />
            </svg>
          )}
          {petal.type === "dot" && (
            <div
              style={{
                width: petal.size * 0.6,
                height: petal.size * 0.6,
                borderRadius: "50%",
                backgroundColor: petal.color,
                opacity: 0.6,
              }}
            />
          )}
          {petal.type === "star" && (
            <svg viewBox="0 0 20 20" width={petal.size} height={petal.size}>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={petal.color}
                opacity="0.7"
              />
            </svg>
          )}
        </div>
      ))}
    </>
  );
}

// ── Pháo hoa ──────────────────────────────────────────────────────
interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

function Fireworks() {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFireworks((prev) => [
        ...prev.slice(-3),
        {
          id: Date.now(),
          x: Math.random() * 70 + 15,
          y: Math.random() * 30 + 5,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        },
      ]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="fixed pointer-events-none"
          style={{ left: `${fw.x}%`, top: `${fw.y}%`, zIndex: 9998 }}
        >
          <div
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: fw.color,
              transform: "translate(-50%, -50%)",
              animation: "firework-flash 0.6s ease-out forwards",
              boxShadow: `0 0 8px 4px ${fw.color}`,
            }}
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: fw.color,
                  ["--angle" as string]: `${angle}deg`,
                  animation: "firework 1.4s ease-out forwards",
                  boxShadow: `0 0 4px ${fw.color}`,
                }}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

// ── Main Export ──────────────────────────────────────────────────
export default function FestivalDecor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mount = () => setMounted(true);
    mount();
  }, []);

  if (!mounted) return null;

  return (
    <>
      <FlagString side="left" />
      <FlagString side="right" />
      <FallingPetals />
      <Fireworks />
    </>
  );
}

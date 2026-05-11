"use client";

import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import getScoreTextColor from "@/utils/get-score-test-color";

const SVG_SIZE = 200;
const STROKE_WIDTH = 16;

const getScoreStrokeVar = (score: number) => {
  if (score >= 80) return "var(--color-success)";
  if (score >= 50) return "var(--color-warning)";
  if (score > 0) return "var(--color-error)";
  return "var(--color-border)";
};

const calculateDash = (score: number, circumference: number) =>
  (score * circumference) / 100;

const ScoreMeter = ({ score = 0 }: { score: number }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  const radius = (SVG_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * Math.PI * 2;
  const [dash, setDash] = useState(calculateDash(0, circumference));
  const [textColor, setTextColor] = useState("text-fg-faint");
  const [strokeColor, setStrokeColor] = useState("var(--color-border)");

  useEffect(() => {
    if (inView) {
      setDash(calculateDash(score, circumference));
      setTextColor(getScoreTextColor(score));
      setStrokeColor(getScoreStrokeVar(score));
    }
  }, [inView, score, circumference]);

  const halfSvgSize = SVG_SIZE / 2;

  const sharedAttributes = {
    cx: halfSvgSize,
    cy: halfSvgSize,
    fill: "none",
    strokeWidth: `${STROKE_WIDTH}px`,
    r: radius,
  };

  return (
    <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-display text-[80px] leading-none font-bold tracking-tight ${textColor}`}
        >
          {score}
        </span>
      </div>

      <svg
        height={SVG_SIZE}
        width={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        ref={ref}
      >
        <circle stroke="var(--color-bg-muted)" {...sharedAttributes} />
        <circle
          stroke={strokeColor}
          style={{ transition: "stroke-dasharray 1s ease, stroke 0.3s ease" }}
          transform={`rotate(-90 ${halfSvgSize} ${halfSvgSize})`}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          {...sharedAttributes}
        />
      </svg>
    </div>
  );
};

export default ScoreMeter;

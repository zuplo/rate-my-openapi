"use client";

import classNames from "classnames";
import AnimatedScore from "../AnimatedScore";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import getScoreTextColor from "@/utils/getScoreTextColor";

const SVG_SIZE = 210;
const STROKE_WIDTH = 18;

const getScoreStrokeColor = (score: number) =>
  classNames({
    "stroke-green-500": score > 66,
    "stroke-yellow-500": score > 33 && score <= 66,
    "stroke-red-500": score <= 33,
  });

const calculateDash = (score: number, circumference: number) =>
  (score * circumference) / 100;

const ScoreMeter = ({ score = 0 }: { score: number }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  const radius = (SVG_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * Math.PI * 2;
  const [dash, setDash] = useState(calculateDash(0, circumference));
  const [textColor, setTextColor] = useState("text-gray-400");
  const [strokeColor, setStrokeColor] = useState("text-gray-400");

  useEffect(() => {
    if (inView) {
      setDash(calculateDash(score, circumference));
      setTextColor(getScoreTextColor(score));
      setStrokeColor(getScoreStrokeColor(score));
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
    <div className="relative">
      <div className="absolute flex h-full w-full items-center justify-center">
        <AnimatedScore
          score={score}
          className={`bold ${textColor} font-plex-sans text-[85px]`}
          id="main"
        />
      </div>

      <svg
        height={SVG_SIZE}
        width={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        ref={ref}
      >
        <circle className="stroke-gray-200" {...sharedAttributes} />
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-[ease]`}
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

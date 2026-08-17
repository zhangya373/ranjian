"use client";

import { useEffect, useRef } from "react";
import type { DyeParams } from "../lib/dye";
import { renderDye } from "../lib/simulator";

type Props = {
  params: DyeParams;
  className?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  label?: string;
};

export default function DyePreview({
  params,
  className = "",
  canvasRef,
  label = "扎染仿真预览",
}: Props) {
  const innerRef = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? innerRef;

  useEffect(() => {
    if (ref.current) renderDye(ref.current, params);
  }, [params, ref]);

  return (
    <canvas
      ref={ref}
      className={`dye-canvas ${className}`}
      aria-label={label}
      role="img"
    />
  );
}

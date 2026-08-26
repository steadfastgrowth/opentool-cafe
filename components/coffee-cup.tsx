import type { ReactNode } from "react";
import { cupColors, cupLabel } from "@/lib/cup";

export function CoffeeCup({
  name,
  size = 96,
}: {
  name: string;
  size?: number;
}) {
  const c = cupColors(name);
  const label = cupLabel(name);
  const px = size / 16;
  const cell = (x: number, y: number, color: string, w = 1, h = 1) => (
    <rect
      key={`${x}-${y}-${color}-${w}-${h}`}
      x={x * px}
      y={y * px}
      width={w * px}
      height={h * px}
      fill={color}
      shapeRendering="crispEdges"
    />
  );

  const cells: ReactNode[] = [];
  const outline = "#2a160c";
  const steam = "#d35400";

  cells.push(cell(6, 0, steam), cell(8, 1, steam), cell(10, 0, steam));
  cells.push(cell(5, 3, outline, 6, 1));
  for (let y = 4; y <= 11; y++) {
    cells.push(cell(4, y, outline));
    cells.push(cell(11, y, outline));
    for (let x = 5; x <= 10; x++) {
      const coffeeTop = 12 - c.fill;
      if (y === 4) cells.push(cell(x, y, "#fff8ea"));
      else if (y < coffeeTop) cells.push(cell(x, y, c.ceramic));
      else if (y === coffeeTop && c.foam) cells.push(cell(x, y, "#fff8ea"));
      else cells.push(cell(x, y, c.coffee));
    }
  }
  cells.push(cell(5, 12, outline, 6, 1));
  cells.push(cell(4, 13, c.plate, 8, 1));
  cells.push(cell(5, 14, outline, 6, 1));

  if (c.handleRight) {
    cells.push(cell(12, 5, outline), cell(13, 5, outline), cell(13, 6, outline), cell(13, 7, outline), cell(13, 8, outline), cell(12, 8, outline));
  } else {
    cells.push(cell(3, 5, outline), cell(2, 5, outline), cell(2, 6, outline), cell(2, 7, outline), cell(2, 8, outline), cell(3, 8, outline));
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {cells}
      </svg>
      <span
        className="font-mono text-[10px] tracking-[0.14em] px-1.5 py-0.5 border-2 border-paper bg-foam"
        style={{ background: c.plate, color: "#fff8ea" }}
      >
        {label}
      </span>
    </div>
  );
}

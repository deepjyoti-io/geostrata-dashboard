"use client";

interface BatterySpokeGaugeProps {
  batteryVolts: number;
  batteryPercent: number;
}

export default function BatterySpokeGauge({
  batteryPercent,
}: BatterySpokeGaugeProps) {
  const totalSpokes = 18;

  const activeSpokes = Math.round(
    (batteryPercent / 100) * totalSpokes
  );

  return (
    <div className="relative mx-auto flex w-full max-w-[280px] flex-col items-center justify-center">
      <svg
        className="h-auto w-full overflow-visible"
        viewBox="0 0 220 120"
      >
        {Array.from({ length: totalSpokes }).map((_, i) => {
          const angle =
            -180 + (i * 180) / (totalSpokes - 1);

          const radians =
            (angle * Math.PI) / 180;

          const isActive =
            i < activeSpokes;

          const cx = 110;
          const cy = 110;

          const rInner = 70;
          const rOuter = 105;

          return (
            <line
              key={i}
              x1={cx + rInner * Math.cos(radians)}
              y1={cy + rInner * Math.sin(radians)}
              x2={cx + rOuter * Math.cos(radians)}
              y2={cy + rOuter * Math.sin(radians)}
              className={
                isActive
                  ? "stroke-primary"
                  : "stroke-muted"
              }
              strokeWidth="8"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-0 flex w-full flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">
          {batteryPercent}%
        </span>
      </div>
    </div>
  );
}

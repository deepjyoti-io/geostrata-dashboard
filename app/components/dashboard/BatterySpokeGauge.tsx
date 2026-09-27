"use client";

interface BatterySpokeGaugeProps {
  batteryVolts: number;
  batteryPercent: number;
}

export default function BatterySpokeGauge({
  batteryVolts,
  batteryPercent,
}: BatterySpokeGaugeProps) {
  const totalSpokes = 18;

  const activeSpokes = Math.round(
    (batteryPercent / 100) * totalSpokes
  );

  return (
    <div className="relative flex flex-col items-center justify-center my-auto w-full max-w-[240px] sm:max-w-[280px] mx-auto pt-4 sm:pt-6 pb-2">

      <svg
        className="w-full h-auto overflow-visible"
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

          const x1 =
            cx + rInner * Math.cos(radians);

          const y1 =
            cy + rInner * Math.sin(radians);

          const x2 =
            cx + rOuter * Math.cos(radians);

          const y2 =
            cy + rOuter * Math.sin(radians);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                isActive
                  ? "#00e676"
                  : "#1e2333"
              }
              strokeWidth="8"
              strokeLinecap="round"
              className={
                isActive
                  ? "drop-shadow-[0_0_5px_rgba(0,230,118,0.3)]"
                  : ""
              }
            />
          );
        })}

      </svg>

      <div className="absolute bottom-2 w-full flex flex-col items-center justify-center">

        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
          {batteryPercent}%
        </span>


      </div>

    </div>
  );
}
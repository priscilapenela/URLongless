// app/components/BarChartVertical.jsx
import React from "react";
import { scaleBand, scaleLinear, max } from "d3";

export function BarChartVertical({ data }) {
  const minBars = 10;
  const filledData = [
    ...data,
    ...Array.from({ length: Math.max(0, minBars - data.length) }, (_, i) => ({
      key: `Empty ${i + 1}`,
      value: 0,
    })),
  ];

  const xScale = scaleBand()
    .domain(filledData.map((d) => d.key))
    .range([0, 100])
    .padding(0.3);

  const yScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([100, 0]);
  
  const barColors = [
    "bg-blue-400", // Azul
    "bg-green-400", // Verde
    "bg-red-400",   // Rojo
    "bg-purple-400", // Morado
    "bg-yellow-400", // Amarillo
    "bg-pink-400",   // Rosa
    "bg-teal-400",   // Teal
    "bg-indigo-400", // Indigo
    "bg-orange-400", // Naranja
    "bg-cyan-400",   // Cian
    // Puedes añadir más colores si esperas tener más de 10 barras
  ];
  return (
    <div
      className="relative h-72 w-full grid"
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "25px",
          "--marginBottom": "56px",
          "--marginLeft": "25px",
        } 
      }
    >
      {/* Y axis */}
      <div className="relative 
      h-[calc(100%-var(--marginTop)-var(--marginBottom))] 
      w-[var(--marginLeft)] 
      translate-y-[var(--marginTop)] 
      overflow-visible"
      >
        {yScale
        .ticks(8)
        .map(yScale.tickFormat(8, "d"))
        .map((value, i) => (
          <div
            key={i}
            style={{ top: `${yScale(+value)}%` }}
            className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-300 w-full text-right pr-2"
          >
            {value}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="absolute inset-0 
      h-[calc(100%-var(--marginTop)-var(--marginBottom))] 
      w-[calc(100%-var(--marginLeft)-var(--marginRight))] 
      translate-x-[var(--marginLeft)] 
      translate-y-[var(--marginTop)] 
      overflow-visible"
      >
        <svg viewBox="0 0 100 100" 
        className="overflow-visible w-full h-full" 
        preserveAspectRatio="none"
        >
          {yScale
          .ticks(8)
          .map(yScale.tickFormat(8, "d"))
          .map((active, i) => (
            <g key={i} 
            transform={`translate(0,${yScale(+active)})`}>
              <line x1={0} 
              x2={100} 
              stroke="currentColor" 
              strokeDasharray="6,5" 
              strokeWidth={0.5} 
              vectorEffect="non-scaling-stroke"/>
            </g>
          ))}
        </svg>

        {data.map((entry, i) => {
            const x = xScale(entry.key);
            const xPosition = (x !== undefined ? x : 0) + xScale.bandwidth() / 2;

            return (
            <div
            key={i}
            className="absolute overflow-visible text-gray-400"
            style={{
                left: `${xPosition}%`,
                top: "100%",
                transform: "rotate(45deg) translateX(4px) translateY(8px)",
            }}
            >
                <div className={`absolute text-xs -translate-y-1/2 whitespace-nowrap`}>
                {entry.key.slice(0, 10) + (entry.key.length > 10 ? "..." : "")}
                </div>
                </div>
            );
        })}


        {filledData.map((d, index) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yScale(0) - yScale(d.value);
          // Selecciona un color del array usando el operador módulo (%)
          const colorClass = barColors[index % barColors.length]; 
          return (
            <div
              key={index}
              style={{
                width: `${barWidth}%`,
                height: `${barHeight}%`,
                borderRadius: "6px 6px 0 0",
                marginLeft: `${xScale(d.key)}%`,
              }}
              // Aplica la clase de color seleccionada
              className={`absolute bottom-0 ${colorClass}`} 
            />
          );
        })}
      </div>
    </div>
  );
}
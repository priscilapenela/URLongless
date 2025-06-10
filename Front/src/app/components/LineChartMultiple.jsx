// app/components/LineChartMultiple.jsx (Tu código original con D3.js)
"use client";
import React from "react";
import {
  scaleTime,
  scaleLinear,
  max,
  line as d3_line,
  curveMonotoneX,
} from "d3";

/**
 * Espera un prop llamado `dataSeries` como:
 * [
 * { name: "Serie 1", data: [{ date: Date, value: number }], color: "#8b5cf6" },
 * { name: "Serie 2", data: [{ date: Date, value: number }], color: "#ec4899" }
 * ]
 */
export default function LineChartMultiple({ dataSeries }) {
  if (!Array.isArray(dataSeries) || dataSeries.length === 0) {
    return <div>No hay datos para mostrar.</div>;
  }
  const allDates = dataSeries.flatMap((serie) => serie.data.map((d) => d.date));
  const allValues = dataSeries.flatMap((serie) => serie.data.map((d) => d.value));

  const xScale = scaleTime()
    .domain([Math.min(...allDates), Math.max(...allDates)])
    .range([0, 100]);

  const yScale = scaleLinear()
    .domain([0, max(allValues)])
    .range([100, 0]);

  const line = d3_line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  return (
    <div
      className="relative h-72 w-full"
      style={{
        "--marginTop": "0px",
        "--marginRight": "8px",
        "--marginBottom": "25px",
        "--marginLeft": "25px",
      }}
    >
      {/* Y axis */}
      <div
        className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
      >
        {yScale
          .ticks(6)
          .map(yScale.tickFormat(6, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{ top: `${yScale(+value)}%` }}
              className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-500 w-full text-right pr-2"
            >
              {value}
            </div>
          ))}
      </div>

      {/* Chart Area */}
      <div
        className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
      >
        <svg viewBox="0 0 100 100" className="overflow-visible w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {yScale
            .ticks(6)
            .map(yScale.tickFormat(6, "d"))
            .map((tick, i) => (
              <g key={i} transform={`translate(0,${yScale(+tick)})`} className="text-zinc-300 dark:text-zinc-700">
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

          {/* Líneas y puntos por serie */}
          {dataSeries.map((serie, idx) => {
            const path = line(serie.data);
            if (!path) return null;

            return (
              <g key={idx}>
                <path
                  d={path}
                  fill="none"
                  stroke={serie.color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {serie.data.map((d, i) => (
                  <circle
                    key={i}
                    cx={xScale(d.date)}
                    cy={yScale(d.value)}
                    r="1.5"
                    fill={serie.color}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Eje X */}
        <div className="translate-y-2">
          {dataSeries[0].data.map((point, i) => (
            <div
              key={i}
              style={{
                left: `${xScale(point.date)}%`,
                top: "100%",
                transform: `translateX(-50%)`,
              }}
              className="absolute text-xs text-zinc-500"
            >
              {point.date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
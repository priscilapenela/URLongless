// app/components/LineChartMultiple.jsx
"use client";
import React from "react";
import {
  scaleTime,
  scaleLinear,
  max,
  line as d3_line,
  curveMonotoneX,
  timeDay // <--- Asegúrate de importar timeDay
} from "d3";

/**
 * Espera un prop llamado `dataSeries` como:
 * [
 * { name: "Serie 1", data: [{ date: Date, value: number }], color: "#8b5cf6" },
 * { name: "Serie 2", data: [{ date: Date, value: number }], color: "#ec4899" }
 * ]
 */
export default function LineChartMultiple({ dataSeries }) {
  // Añade este console.log para ver los datos que LineChartMultiple recibe
  console.log("LineChartMultiple - Received dataSeries:", dataSeries);

  const processedDataSeries = dataSeries.map(serie => ({
    ...serie,
    data: serie.data.map(d => ({
      ...d,
      // *** CAMBIO CLAVE AQUÍ: Normaliza la fecha a la medianoche UTC ***
      date: new Date(new Date(d.date).setUTCHours(0, 0, 0, 0)) // Establece la hora a 00:00:00 UTC
    }))
  }));

  const allDates = processedDataSeries.flatMap((serie) =>
    Array.isArray(serie.data) ? serie.data.map((d) => d.date) : []
  );
  const allValues = processedDataSeries.flatMap((serie) =>
    Array.isArray(serie.data) ? serie.data.map((d) => d.value) : []
  );

  if (allDates.length === 0 || allValues.length === 0) {
    console.warn("LineChartMultiple - No dates or values found after flatMap.");
    return <div>No hay datos para mostrar (después de procesamiento interno).</div>;
  }

  const uniqueSortedDates = Array.from(new Set(allDates.map(date => date.getTime())))
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());

  const minDate = uniqueSortedDates.length > 0 ? uniqueSortedDates[0] : new Date();
  const maxDate = uniqueSortedDates.length > 0 ? uniqueSortedDates[uniqueSortedDates.length - 1] : new Date();

  // Si minDate y maxDate son iguales (un solo punto de datos), ajusta el dominio para que sea visible
  if (minDate.getTime() === maxDate.getTime()) {
      minDate.setHours(minDate.getHours() - 1); // un rango de 2 horas
      maxDate.setHours(maxDate.getHours() + 1);
  }
  
  const xScale = scaleTime()
    .domain([minDate, maxDate]) // Usa los dominios ajustados
    .range([0, 100]);

  const yScale = scaleLinear()
    .domain([0, max(allValues) === 0 ? 1 : max(allValues)]) // Evita dominio [0,0] si max es 0
    .range([100, 0]);

  const line = d3_line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  console.log("LineChartMultiple - Scales calculated. xScale domain:", xScale.domain(), "yScale domain:", yScale.domain());
  console.log("LineChartMultiple - Unique sorted dates for X axis:", uniqueSortedDates);
  console.log("LineChartMultiple - X axis ticks for rendering:", xScale.ticks(timeDay.every(1))); // El log de los ticks

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
          {processedDataSeries.map((serie, idx) => { // <-- Usa processedDataSeries aquí
            // Asegúrate de que serie.data existe y es un array antes de pasar a 'line'
            if (!Array.isArray(serie.data) || serie.data.length === 0) {
              return null; // No renderiza la serie si no tiene datos válidos
            }
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
          {uniqueSortedDates.map((tickDate, i) => (
              <div
                key={i}
                style={{
                  left: `${xScale(tickDate)}%`,
                  top: "100%",
                  transform: `translateX(-50%)`,
                }}
                className="absolute text-xs text-zinc-500">
                {
                tickDate.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  timeZone: 'UTC' // <-- Añade esta opción
                })
                }
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
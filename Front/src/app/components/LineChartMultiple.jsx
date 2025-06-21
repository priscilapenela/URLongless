// app/components/LineChartMultiple.jsx
"use client";
import React from "react";
import {
  scaleTime,
  scaleLinear,
  max,
  line as d3_line,
  curveMonotoneX,
  timeDay, 
  bisector 
} from "d3";

import {TooltipTrigger, TooltipContent, useTooltipContext } from "./Tooltip";

export default function LineChartMultiple({ dataSeries }) {
  
  console.log("LineChartMultiple - Received dataSeries:", dataSeries);
  const [activeTooltipData, setActiveTooltipData] = React.useState(null); 

  const { setTooltip } = useTooltipContext("LineChartMultiple"); //

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

  const uniqueSortedDates = Array.from(
    new Set(allDates.map((date) => date.getTime()))
  )
    .map((time) => new Date(time))
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

  const bisectDate = bisector((d) => d.date).left;

  // Handler para el movimiento del puntero para el tooltip
  const handlePointerMove = (event) => {
    console.log("Pointer Move Event Fired!");
    if (event.pointerType === "mouse") {
      const svgRect = event.currentTarget.getBoundingClientRect();

      const xInViewBox = ((event.clientX - svgRect.left) / svgRect.width) * 100;
      const hoveredDate = xScale.invert(xInViewBox);

      console.log("Hovered Date:", hoveredDate);

      let closestDataPoint = null;
      let minDistance = Infinity;

      processedDataSeries.forEach(serie => {
        if (!Array.isArray(serie.data) || serie.data.length === 0) return;

        // Encuentra el índice del punto de datos más cercano a la fecha sobrevolada
        const idx = bisectDate(serie.data, hoveredDate, 1); // Busca desde el segundo elemento
        const d0 = serie.data[idx - 1]; // Punto anterior
        const d1 = serie.data[idx];     // Punto actual

        let d = null;
        if (d0 && d1) {
          // Determina cuál de los dos puntos (anterior o actual) está más cerca de la fecha sobrevolada
          d = hoveredDate - d0.date > d1.date - hoveredDate ? d1 : d0;
        } else if (d0) {
          d = d0;
        } else if (d1) {
          d = d1;
        }

        if (d) {
          // Calcula la distancia en el eje X (para evitar tooltips erráticos entre días)
          const distance = Math.abs(hoveredDate.getTime() - d.date.getTime());
          // Considera solo puntos que estén a menos de un cierto umbral de tiempo (ej. medio día)
          if (distance < minDistance && distance < (12 * 60 * 60 * 1000)) { // 12 horas en ms
            minDistance = distance;
            closestDataPoint = {
              ...d,
              seriesName: serie.name,
              color: serie.color,
            };
          }
        }
      });
      console.log("Closest Data Point:", closestDataPoint);
      setActiveTooltipData(closestDataPoint);

      if (closestDataPoint) {
      setActiveTooltipData(closestDataPoint);
      setTooltip({ x: event.clientX, y: event.clientY }); 
      // También podemos pasar la posición X del punto en el viewBox (0-100) al estado,
      // para usarla en la línea vertical.
      // O calcularla aquí:
      const xCoordInViewBox = xScale(closestDataPoint.date);
      setTooltipLineX(xCoordInViewBox); // <-- NUEVO: Establece la posición X de la línea
      console.log("Setting Tooltip Position in Context:", { x: event.clientX, y: event.clientY });
    } else {
      setActiveTooltipData(null);
      setTooltip(undefined);
      setTooltipLineX(null); // <-- NUEVO: Oculta la línea si no hay tooltip
    }
    }
  };

  const handlePointerLeave = (event) => {
    console.log("Pointer Leave Event Fired!");
    if (event.pointerType === "mouse") {
      setActiveTooltipData(null);
      setTooltip(undefined);
      setTooltipLineX(null); // <-- NUEVO: Oculta la línea
    }
  };

  const [tooltipLineX, setTooltipLineX] = React.useState(null);

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
        <svg viewBox="0 0 100 100" 
        className="overflow-visible w-full h-full" 
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        >
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
          {processedDataSeries.map((serie, idx) => { 
            if (!Array.isArray(serie.data) || serie.data.length === 0) {
              return null; 
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
                {serie.data.map((d, dataIdx) => (
                  <circle
                    key={`${idx}-${dataIdx}`} // Una key única para cada círculo
                    cx={xScale(d.date)}
                    cy={yScale(d.value)}
                    r={1} // Radio del círculo, ajusta según tu preferencia
                    fill={serie.color} // Mismo color que la línea
                    strokeWidth="7" // Ancho del borde (opcional)
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            );
          })}

          {tooltipLineX !== null && (
            <line
              x1={tooltipLineX}
              y1={0}
              x2={tooltipLineX}
              y2={100}
              stroke="#cbd5e1"
              strokeWidth="0.5"
              strokeDasharray="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity" // Opcional: línea punteada/discontinua
              vectorEffect="non-scaling-stroke"
            />
          )}

        </svg>

        {/* Tooltip Content */}
          {activeTooltipData && ( // <-- Muestra el TooltipContent si hay datos
            <TooltipContent>
              <div className="flex flex-col text-xs text-zinc-900 dark:text-zinc-50">
                <span className="font-semibold" style={{ color: activeTooltipData.color }}>
                  {activeTooltipData.seriesName}
                </span>
                <span>
                  Fecha:{" "}
                  {activeTooltipData.date.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: 'UTC'
                  })}
                </span>
                <span>Clics: {activeTooltipData.value}</span>
              </div>
            </TooltipContent>
          )}

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
                className="absolute text-xs text-zinc-500"
              >
                {tickDate.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: 'UTC'
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
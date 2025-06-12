// Front/src/app/components/DonutChart.jsx
"use client"; 
import React from 'react';
import { pie, arc } from "d3";

const defaultColors = [
  "#7e4cfe",
  "#895cfc",
  "#956bff",
  "#a37fff",
  "#b291fd",
  "#b597ff",
  "#c1a6ff",
  "#ccb5ff",
  "#d7c4ff",
  "#e2d3ff",
];

// Ahora el componente acepta 'series' y 'total' directamente sin anotaciones de tipo
export default function DonutChart({ data, total }) {
  console.log('Series:', data)
  console.log('Data:', total)
  const radius = 420; 
  const gap = 0.01; 
  const lightStrokeEffect = 10; 

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-gray-500">No hay datos para la gráfica de Dona.</div>
    );
  }

  const pieLayout = pie()
    .value((d) => d.value)
    .padAngle(gap)
    .sort(null); 

  const innerRadius = radius / 1.625;
  const arcGenerator = arc()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2);

  const arcClip = arc()
    .innerRadius(innerRadius + lightStrokeEffect / 2)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2);

  const labelRadius = radius * 0.825;
  const arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const arcs = pieLayout(data); // Usa los 'series' que vienen por props

  // Calculate the angle for each slice
  // Se elimina la anotación de tipo del parámetro 'd'
  function computeAngle(d) {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  }

  const minAngle = 20;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute flex flex-col items-center justify-center">
        <div className="text-center">
          <p className={`text-lg text-zinc-500`}>Total</p>
          <p className={`text-4xl transition-colors duration-300 font-bold`}>{total.toLocaleString("en-US")}</p>
        </div>
      </div>
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible h-full"
      >
        <defs>
          {arcs.map((d, i) => (
            <React.Fragment key={`defs-${i}`}>
              {/* Se elimina la anotación de tipo del parámetro 'd' en arcClip(d) */}
              <clipPath id={`donut-c1-clip-${i}`}>
                <path d={arcClip(d) || undefined} />
              </clipPath>
              <linearGradient id={`donut-c1-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="55%" stopColor={defaultColors[i % defaultColors.length]} stopOpacity={0.95} />
                <stop offset="100%" stopColor={defaultColors[i % defaultColors.length]} stopOpacity={0.7} />
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>

        {arcs.map((d, i) => (
          <g key={`donut-slice-${i}`}>
            <g clipPath={`url(#donut-c1-clip-${i})`}>
              {/* Se elimina la anotación de tipo del parámetro 'd' en arcGenerator(d) */}
              <path
                fill={`url(#donut-c1-gradient-${i})`}
                stroke="#ffffff33"
                strokeWidth={lightStrokeEffect}
                d={arcGenerator(d) || undefined}
              />
            </g>

            {computeAngle(d) > minAngle && (
              <text
                transform={`translate(${arcLabel.centroid(d)})`}
                textAnchor="middle"
                fontSize={38}
                fill="#eee"
              >
                <tspan x="0" y="-0.4em" fontWeight="600">
                  {d.data.name}
                </tspan>
                <tspan x="0" y="0.7em" fillOpacity={0.7}>
                  {((d.data.value / total) * 100).toFixed(0)}%
                </tspan>
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
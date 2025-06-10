// Front/src/app/components/BubbleChart.jsx
import React from "react";
import * as d3 from "d3";
// Importa HierarchyNode desde 'd3-hierarchy' para el tipo de datos
import { HierarchyNode } from "d3-hierarchy";

// Las clases de colores son de Tailwind CSS.
// El componente usará `backgroundColor: "currentColor"` que toma el color de la clase.
const colors = [
  "text-pink-400",
  "text-violet-500",
  "text-lime-500",
  "text-sky-400",
  "text-orange-400",
  "text-blue-500",
  "text-green-500",
  "text-red-500",
  "text-purple-500",
  "text-yellow-500",
  "text-teal-400",
  "text-indigo-400",
  "text-rose-400",
];

// El componente ahora acepta 'data' como una prop
export default function BubbleChart({ data }) {
  // Asegúrate de que los datos no estén vacíos o sean nulos antes de procesar
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No hay datos para mostrar el gráfico de burbujas.</div>;
  }

  // Definir escala de color. El dominio serán los nombres de los países.
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.country)) // El dominio debe ser los países únicos
    .range(colors); // El rango son las clases de Tailwind

  const strokeSize = 1;
  // Definir el layout 'pack'
  const pack = d3.pack().size([1000, 1000]).padding(12);

  // Computar la jerarquía y aplicar el layout 'pack'
  // Aquí es donde mapeamos los datos de entrada a la estructura esperada por D3 hierarchy:
  // 'total_clicks' se usa para el tamaño de la burbuja (value)
  // 'country' se usa para el nombre y el color (sector)
  const root = pack(
    d3.hierarchy({ children: data }) // Envuelve los datos de entrada en un objeto con 'children'
      .sum((d) => (d).total_clicks) // Suma por el total de clicks
      .sort((a, b) => (b.value || 0) - (a.value || 0)) // Ordenar para una disposición consistente
  );

  // Crear los nodos de la burbuja
  const nodes = root.leaves().map((d) => {
    const x = d.x;
    const y = d.y;
    const r = d.r;
    // 'fill' obtendrá la clase Tailwind basada en el país
    const fill = color((d.data).country);
    const name = (d.data).country; // El nombre de la burbuja es el país
    const value = (d.data).total_clicks; // El valor es el total de clicks

    return {
      x,
      y,
      r,
      fill,
      name,
      value,
    };
  });

  return (
    <div className="relative w-full aspect-square max-w-[18rem] mx-auto">
      {nodes.map((node, i) => (
        <div
          key={i}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${node.fill}`}
          style={{
            left: `${(node.x / 1000) * 100}%`,
            top: `${(node.y / 1000) * 100}%`,
            width: `${((node.r * 2) / 1000) * 100}%`,
            height: `${((node.r * 2) / 1000) * 100}%`,
            borderRadius: "50%",
            backgroundColor: "currentColor", // Usa el color de la clase Tailwind
            border: `${strokeSize}px solid #ffffff33`,
          }}
          // El 'title' se mostrará como un tooltip al pasar el ratón
          title={`${node.name}\n${d3.format(",d")(node.value)}`}
        >
          {/* Renderizar texto solo si la burbuja es lo suficientemente grande */}
          {node.r > 25 && ( // Ajusta este umbral según sea necesario
            <>
              <div
                className="text-white text-center whitespace-nowrap font-bold"
                style={{
                  fontSize: `${node.r / 9}px`,
                  lineHeight: `${node.r / 7}px`,
                }}
              >
                {node.name}
              </div>
              <div
                className="text-white text-center whitespace-nowrap opacity-70"
                style={{
                  fontSize: `${node.r / 10}px`,
                  lineHeight: `${node.r / 8}px`,
                }}
              >
                {d3.format(",d")(node.value)}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
// app/components/LineChartMultiple.jsx (Con rosencharts.com)
"use client";
import React from "react";
// Asumiendo que rosencharts tiene un componente LineChart
// La forma de importación puede variar, consulta su documentación
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from '@rosen-charts/line-chart'; 
// Podría ser de un paquete específico o si son módulos individuales.

/**
 * Espera un prop llamado `dataSeries` como:
 * [
 * { name: "Serie 1", data: [{ date: Date, value: number }], color: "#8b5cf6" },
 * { name: "Serie 2", data: [{ date: Date, value: number }], color: "#ec4899" }
 * ]
 *
 * NOTA: rosencharts.com puede esperar el formato de datos diferente.
 * Deberías adaptar dataSeries al formato que rosencharts espera.
 * Normalmente, esperan un array de objetos con las claves de los ejes directamente.
 * Ejemplo de formato común:
 * [
 * { date: "2025-06-01", "Serie 1": 10, "Serie 2": 20 },
 * { date: "2025-06-02", "Serie 1": 15, "Serie 2": 22 },
 * ...
 * ]
 * Y luego mapear las líneas. Esto es una suposición.
 */
export default function LineChartMultiple({ dataSeries }) {
  if (!Array.isArray(dataSeries) || dataSeries.length === 0) {
    return <div>No hay datos para mostrar.</div>;
  }

  // Si rosencharts espera un formato diferente, aquí harías la transformación
  // Ejemplo hipotético de transformación para rosencharts si usa un formato plano:
  const transformedData = [];
  // Esto es muy dependiente del formato exacto que rosencharts espera.
  // Podrías necesitar iterar sobre las fechas únicas y luego sobre cada serie
  // para construir un objeto por fecha con los valores de cada serie.
  // Esto es una suposición, revisa la documentación de rosencharts.com

  return (
    <div className="h-full w-full"> {/* Asegura que el contenedor tenga dimensiones */}
      {/* Asumiendo una estructura básica de rosencharts para LineChart */}
      {/* Tendrías que ajustar las props y componentes internos según la documentación de rosencharts */}
      <LineChart width={500} height={300} data={dataSeries[0].data} // Esto solo muestra la primera serie. Necesitarías adaptar.
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" type="category" /> {/* O "time" si lo soporta para objetos Date */}
        <YAxis />
        <Tooltip />
        <Legend />
        {dataSeries.map((serie, idx) => (
          <Line key={idx} type="monotone" dataKey="value" stroke={serie.color} name={serie.name} />
        ))}
      </LineChart>
    </div>
  );
}
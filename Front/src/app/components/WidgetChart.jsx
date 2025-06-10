// app/components/WidgetChart.jsx
"use client";
import React, { useEffect, useState } from "react";
import LineChartMultiple from "./LineChartMultiple";
// Importa otros componentes de gráfica si decides crearlos o usar rosencharts
// import BarChart from "./BarChart";
// import PieChart from "./PieChart";

export default function WidgetChart({ id, chartType, dataType, onRemove }) {
  const [dataSeries, setDataSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let apiUrl = '';

    // Lógica para determinar la URL de la API según el dataType
    switch (dataType) {
      case 'clicks_over_time':
        apiUrl = `http://localhost:8000/analytics/clicks_over_time?start=2025-06-01T00:00:00&end=2025-06-10T23:59:59`;
        break;
      // Añade más casos para otros tipos de datos (ej. 'referrers', 'locations')
      // case 'referrers':
      //   apiUrl = `http://localhost:8000/analytics/referrers`;
      //   break;
      default:
        setError("Tipo de dato no soportado.");
        setLoading(false);
        return;
    }

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        // Asegúrate de que el formato de los datos sea compatible con tus gráficas
        const formatted = json.map((serie) => ({
          name: serie.name,
          color: serie.color,
          data: serie.data.map((point) => ({
            date: new Date(point.date),
            value: point.value,
          })),
        }));
        setDataSeries(formatted);
      })
      .catch((err) => {
        console.error("Error cargando analytics:", err);
        setError("No se pudieron cargar los datos. " + err.message);
        setDataSeries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dataType]); // Vuelve a ejecutar cuando dataType cambie

  // Lógica para renderizar el tipo de gráfica correcto
  const renderChart = () => {
    if (loading) return <div className="text-center py-4">Cargando datos...</div>;
    if (error) return <div className="text-center py-4 text-red-600">Error: {error}</div>;
    if (!dataSeries || dataSeries.length === 0) return <div className="text-center py-4">No hay datos disponibles.</div>;

    switch (chartType) {
      case "LineChartMultiple":
        return <LineChartMultiple dataSeries={dataSeries} />;
      // case "BarChart":
      //   return <BarChart data={dataSeries[0].data} />; // Asumiendo que BarChart espera un formato diferente
      // case "PieChart":
      //   return <PieChart data={dataSeries[0].data} />;
      default:
        return <div className="text-center py-4 text-red-600">Tipo de gráfica no reconocida.</div>;
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Título del Widget ({dataType})</h3> {/* Puedes hacerlo dinámico */}
        {/* Botón de eliminar widget */}
        {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="text-gray-500 hover:text-gray-700"
              title="Eliminar widget"
            >
              <RxCrossCircled />
            </button>
          )}
      </div>
      <div className="flex-grow min-h-0"> {/* Permite que el gráfico ocupe el espacio restante */}
        {renderChart()}
      </div>
    </div>
  );
}
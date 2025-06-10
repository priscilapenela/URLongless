// Front/src/app/components/WidgetChart.jsx
"use client";
import React, { useEffect, useState } from "react";
import LineChartMultiple from "./LineChartMultiple";
import { BarChartVertical } from "./BarChartVertical";
import { RxCrossCircled } from "react-icons/rx";
import BubbleChart from './BubbleChart'; // <--- Importa el nuevo componente

export default function WidgetChart({ id, chartType, dataType, onRemove }) {
  const [dataSeries, setDataSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let apiUrl = '';

    // Ajustar el rango de fechas. Puedes pasar estas fechas como props si es necesario.
    const startDate = new Date(2025, 5, 1); // 1 de junio de 2025
    const endDate = new Date(2025, 5, 10); // 10 de junio de 2025 (o fecha actual)
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];


    switch (dataType) {
        case 'clicks_over_time':
            apiUrl = `http://127.0.0.1:8000/analytics/clicks_over_time?start=${formattedStartDate}T00:00:00&end=${formattedEndDate}T23:59:59`;
            break;
        case 'referers_analytics':
            apiUrl = `http://127.0.0.1:8000/analytics/referrers?start=${formattedStartDate}T00:00:00&end=${formattedEndDate}T23:59:59`;
            break;
        case 'geo_clicks_bubble': // <--- Nuevo caso para los datos del gráfico de burbujas
            apiUrl = `http://127.0.0.1:8000/analytics/geo_clicks?start=${formattedStartDate}T00:00:00&end=${formattedEndDate}T23:59:59`;
            break;
        default:
            setError("Tipo de dato no soportado.");
            setLoading(false);
            return;
    }

    fetch(apiUrl)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Error HTTP! estado: ${res.status}`);
            }
            return res.json();
        })
        .then((json) => {
            setDataSeries(json);
        })
        .catch((err) => {
            console.error(`Error cargando analytics para ${dataType}:`, err);
            setError(`No se pudieron cargar los datos para ${dataType}. ` + err.message);
            setDataSeries([]);
        })
        .finally(() => {
            setLoading(false);
        });
  }, [dataType]);

  const renderChart = () => {
    if (loading) {
      return <div className="text-center text-gray-500">Cargando datos...</div>;
    }
    if (error) {
      return <div className="text-center text-red-500">Error: {error}</div>;
    }
    if (!dataSeries || dataSeries.length === 0) {
      return <div className="text-center text-gray-500">No hay datos disponibles.</div>;
    }

    switch (chartType) {
      case "LineChartMultiple":
        return <LineChartMultiple data={dataSeries} />;
      case "BarChartVertical":
        return <BarChartVertical data={dataSeries} />;
      case "BubbleChart": // <--- Renderizar el nuevo gráfico de burbujas
        return <BubbleChart data={dataSeries} />;
      default:
        return <div className="text-center text-red-500">Tipo de gráfico no soportado.</div>;
    }
  };

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {dataType === "clicks_over_time" && "Clicks a lo largo del tiempo"}
          {dataType === "referrers_analytics" && "Fuentes de Tráfico"}
          {dataType === "geo_clicks_bubble" && "Clicks por País"} {/* Nuevo título */}
        </h3>
        <button className="text-gray-500 hover:text-red-600" onClick={() => onRemove(id)}>
          <RxCrossCircled className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  );
}
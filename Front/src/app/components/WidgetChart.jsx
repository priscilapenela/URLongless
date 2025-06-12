// Front/src/app/components/WidgetChart.jsx
"use client";
import React, { useEffect, useState } from "react";
import LineChartMultiple from "./LineChartMultiple";
import { BarChartVertical } from "./BarChartVertical";
import { RxCrossCircled } from "react-icons/rx";
import BubbleChart from './BubbleChart';
import DonutChart from "./DonutChart"; // Asegúrate de que este componente exista y sea funcional

export default function WidgetChart({ id, chartType, dataType, onRemove, startDate, endDate }) {
  const [dataSeries, setDataSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0); // Estado para el total del DonutChart
   // Paleta de colores para las líneas (puedes expandirla)
  const lineColors = ["#8b5cf6", "#ec4899", "#10b981", "#ef4444", "#3b82f6", "#f97316", "#a855f7", "#be185d", "#84cc16", "#06b6d4"];

  useEffect(() => {
    console.log(`[${id}] useEffect triggered for dataType: ${dataType}`);
    console.log(`[${id}] Props - startDate: ${startDate?.toISOString()} endDate: ${endDate?.toISOString()}`);
    setLoading(true);
    setError(null);
    let apiUrl = '';

    if (!startDate || !endDate) {
      setError("Fechas no seleccionadas o inválidas.");
      setLoading(false);
      console.warn(`[${id}] Fechas no válidas. No se hará la petición.`);
      return;
    }
  
    const formattedStartDate = startDate.toISOString().split('.')[0] + 'Z'; // Ejemplo: 2025-04-03T03:00:00Z
    const formattedEndDate = endDate.toISOString().split('.')[0] + 'Z'; // Ejemplo: 2025-04-09T03:00:00Z

    switch (dataType) {
      case 'clicks_over_time':
        apiUrl = `http://127.0.0.1:8000/analytics/clicks_over_time?start=${formattedStartDate}&end=${formattedEndDate}`;
        break;
      case 'referers_analytics':
        apiUrl = `http://127.0.0.1:8000/analytics/referers?start=${formattedStartDate}&end=${formattedEndDate}`;
        break;
      case 'geo_clicks_bubble':
        apiUrl = `http://127.0.0.1:8000/analytics/geo_clicks?start=${formattedStartDate}&end=${formattedEndDate}`;
        break;
      case "clicks_by_url":
        apiUrl = `http://127.0.0.1:8000/analytics/clicks_by_url?start=${formattedStartDate}&end=${formattedEndDate}`;
        break;
      default:
        setError("Tipo de dato no soportado.");
        setLoading(false);
        console.error(`[${id}] Tipo de dato no soportado: ${dataType}`);
        return;
    }

    console.log(`[${id}] Fetching data from: ${apiUrl}`);

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP! estado: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        console.log(`[${id}] Data received (raw):`, json);

        let processedSeriesData = []; 
        let calculatedTotal = 0;
        let colorIndex = 0; 

        if (dataType === 'clicks_by_url') {
            if (json && Array.isArray(json.series)) {
                processedSeriesData = json.series.map(item => ({
                    name: item.name,
                    value: item.value
                }));
                calculatedTotal = json.total || 0; 
            } else {
                console.warn(`[${id}] Data for clicks_by_url is not in expected DonutChartResponse format (missing 'series' array):`, json);
                processedSeriesData = [];
                calculatedTotal = 0;
            }
        } else if (dataType === 'clicks_over_time') {
          const seriesFromApi = Array.isArray(json) ? json : [json];

          processedSeriesData = seriesFromApi.map(serie => {
            const dataPoints = Array.isArray(serie.data)
              ? serie.data.map(d => ({
                date: new Date(d.date), // Confirmamos la conversión a Date
                value: d.value
              }))
              : [];

            // Asigna un color único a cada serie
            const assignedColor = serie.color || lineColors[colorIndex % lineColors.length];
            colorIndex++; // Incrementa para la siguiente serie

            return {
              name: serie.name || serie.url_key || 'Serie Desconocida',
              data: dataPoints,
              color: assignedColor
            };
          });
        } else if (dataType === 'referers_analytics' || dataType === 'geo_clicks_bubble') {
            if (Array.isArray(json)) {
                processedSeriesData = json;
            } else {
                console.warn(`[${id}] Data for ${dataType} is not an array as expected:`, json);
                processedSeriesData = [];
            }
        } else {
            console.warn(`[${id}] Unhandled dataType for processing: ${dataType}`);
            processedSeriesData = [];
        }

        console.log(`[${id}] Data received (processed):`, processedSeriesData);
        setDataSeries(processedSeriesData);
        setTotalValue(calculatedTotal); // Guarda el total para el DonutChart
      })
      .catch((err) => {
        console.error(`[${id}] Error cargando analytics para ${dataType}:`, err);
        setError(`No se pudieron cargar los datos para ${dataType}. ` + err.message);
        console.log(`[${id}] Data received (processed for chart - FINAL before setDataSeries):`, processedSeriesData);
        setDataSeries([]);
        setTotalValue(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dataType, startDate, endDate, id]); // Asegúrate de incluir todas las dependencias

  const renderChart = () => {
    console.log(`[${id}] Rendering chart. Loading: ${loading}, Error: ${error}, DataSeries Length: ${dataSeries?.length}`);
    if (loading) {
      return <div className="text-center text-gray-500">Cargando datos...</div>;
    }
    if (error) {
      return <div className="text-center text-red-500">Error: {error}</div>;
    }
    if (!dataSeries || dataSeries.length === 0) {
      if (chartType === "DonutChart" && totalValue === 0) {
        return <div className="text-center text-gray-500">No hay datos disponibles.</div>;
      }
      if (chartType !== "DonutChart") {
        return <div className="text-center text-gray-500">No hay datos disponibles.</div>;
      }
    }

    switch (chartType) {
      case "LineChartMultiple":
        return <LineChartMultiple dataSeries={dataSeries} />;
      case "BarChartVertical":
        return <BarChartVertical data={dataSeries} />;
      case "BubbleChart":
        return <BubbleChart data={dataSeries} />;
      case "DonutChart":
        return <DonutChart data={dataSeries} total={totalValue} />; 
      default:
        return <div className="text-center text-red-500">Tipo de gráfico no soportado.</div>;
    }
  };

  return (
    <div className="relative p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {dataType === "clicks_over_time" && "Clicks a lo largo del tiempo"}
          {dataType === "referers_analytics" && "Fuentes de Tráfico"}
          {dataType === "geo_clicks_bubble" && "Clicks por País"}
          {dataType === "clicks_by_url" && "Clicks por URL"} {/* Nuevo título */}
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
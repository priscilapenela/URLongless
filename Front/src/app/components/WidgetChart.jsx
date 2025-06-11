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

    // Formatea las fechas para la URL. Es importante que coincidan con lo que espera FastAPI.
    // FastAPI espera ISO format con Z (UTC) o sin Z si se asume UTC en el backend.
    // Usar toISOString directamente y luego ajustar si es necesario para el backend.
    const formattedStartDate = startDate.toISOString().split('.')[0] + 'Z'; // Ejemplo: 2025-04-03T03:00:00Z
    const formattedEndDate = endDate.toISOString().split('.')[0] + 'Z'; // Ejemplo: 2025-04-09T03:00:00Z
    
    // Si tu backend espera YYYY-MM-DDTHH:MM:SS sin Z, puedes usar:
    // const formattedStartDate = startDate.toISOString().split('.')[0];
    // const formattedEndDate = endDate.toISOString().split('.')[0];
    // Pero con el Z es más robusto para UTC.

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

        let processedData = [];
        let calculatedTotal = 0;

        // *** CONDICIONALIZAR EL PROCESAMIENTO SEGÚN EL TIPO DE DATOS ***
        if (dataType === 'clicks_by_url') {
            // Este es el caso para el DonutChart
            if (json && Array.isArray(json.series)) {
                processedData = json.series.map(item => ({
                    name: item.name,
                    value: item.value
                }));
                calculatedTotal = json.total || 0; // Obtiene el total del JSON
            } else {
                console.warn(`[${id}] Data for clicks_by_url is not in expected DonutChartResponse format (missing 'series' array):`, json);
                processedData = [];
                calculatedTotal = 0;
            }
        } else if (dataType === 'clicks_over_time') {
            // Este es el caso para el LineChartMultiple
            if (Array.isArray(json)) {
                processedData = json.map(serie => {
                    const processedSerieData = Array.isArray(serie.data)
                        ? serie.data.map(d => ({
                              date: new Date(d.date), // Convertir a objeto Date
                              value: d.value
                          }))
                        : [];
                    return {
                        ...serie,
                        data: processedSerieData
                    };
                });
            } else {
                console.warn(`[${id}] Data for clicks_over_time is not an array as expected:`, json);
                processedData = [];
            }
        } else if (dataType === 'referers_analytics' || dataType === 'geo_clicks_bubble') {
            // Estos son para BarChartVertical y BubbleChart, esperan un array de objetos
            if (Array.isArray(json)) {
                processedData = json;
            } else {
                console.warn(`[${id}] Data for ${dataType} is not an array as expected:`, json);
                processedData = [];
            }
        } else {
            console.warn(`[${id}] Unhandled dataType for processing: ${dataType}`);
            processedData = [];
        }

        console.log(`[${id}] Data received (processed):`, processedData);
        setDataSeries(processedData);
        setTotalValue(calculatedTotal); // Guarda el total para el DonutChart
      })
      .catch((err) => {
        console.error(`[${id}] Error cargando analytics para ${dataType}:`, err);
        setError(`No se pudieron cargar los datos para ${dataType}. ` + err.message);
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
    // Para el DonutChart, si no hay series pero el total es 0, también "No hay datos"
    if (!dataSeries || dataSeries.length === 0) {
      return <div className="text-center text-gray-500">No hay datos disponibles.</div>;
    }

    switch (chartType) {
      case "LineChartMultiple":
        return <LineChartMultiple dataSeries={dataSeries} />;
      case "BarChartVertical":
        return <BarChartVertical data={dataSeries} />;
      case "BubbleChart":
        return <BubbleChart data={dataSeries} />;
      case "DonutChart": // Agrega el caso para DonutChart
        // Pasa los datos de la serie y el total al DonutChart
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
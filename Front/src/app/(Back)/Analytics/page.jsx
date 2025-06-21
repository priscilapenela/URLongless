// Front/src/app/(Back)/Analytics/page.jsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import styles from "./Analytics.module.css";
import { FiPlusCircle } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { TbAdjustmentsFilled } from "react-icons/tb";
import ReactDOM from "react-dom/client";
import WidgetChart from '../../components/WidgetChart';

// Importar react-datepicker y sus estilos
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Importar el locale español
import es from 'date-fns/locale/es';

// Registrar el locale español para react-datepicker
registerLocale('es', es);

export default function AnalyticsPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);

  // Estado para las fechas seleccionadas
  // Inicializar con un rango predeterminado (puedes ajustar esto)
  const [startDate, setStartDate] = useState(new Date(2025, 3, 3)); // 3 de abril de 2025
  const [endDate, setEndDate] = useState(new Date(2025, 3, 9)); // 9 de abril de 2025

  const initialWidgets = [
    { id: 'widget-1', title: 'Clicks a lo largo del tiempo', chartType: 'LineChartMultiple', dataType: 'clicks_over_time', w: 5, h: 6},
    { id: 'widget-3', title: 'Referers', chartType: 'BarChartVertical', dataType: 'referers_analytics', w: 5, h: 6},
    { id: 'widget-2', title: 'Clicks por País', chartType: 'BubbleChart', dataType: 'geo_clicks_bubble', w: 3, h: 6},
    { id: 'widget-4', title: 'Clicks por URL', chartType: 'DonutChart', dataType: 'clicks_by_url', w: 3, h: 6},
  ];
  const [widgets, setWidgets] = useState(initialWidgets);
  const nextWidgetId = useRef(widgets.length + 1);

  /*const addWidget = useCallback(() => {
    const newWidgetId = `widget-${nextWidgetId.current++}`;
    const newWidget = {
      id: newWidgetId,
      chartType: "BarChartVertical",
      dataType: "referers_analytics",
      w: 3,
      h: 3,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  }, []);*/

  const removeWidget = useCallback((idToRemove) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== idToRemove));
  }, []);

  // Función para limpiar las fechas
  const clearDates = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  // Effect 1: Initialize GridStack and its core listeners ONCE
  useEffect(() => {
    if (gridRef.current && !gridInstance.current) {
      gridInstance.current = GridStack.init(
        {
          cellHeight: "70px",
          margin: 10,
          float: true,
        },
        gridRef.current
      );

      gridInstance.current.on('removed', (event, items) => {
        items.forEach(item => {
          setWidgets(prevWidgets => {
            const updated = prevWidgets.filter(w => w.id !== item.id);
            if (item.el && item.el.__reactRoot) {
              const rootToUnmount = item.el.__reactRoot;
              delete item.el.__reactRoot;
              setTimeout(() => {
                if (rootToUnmount) {
                  rootToUnmount.unmount();
                }
              }, 0);
            }
            return updated;
          });
        });
      });

      gridInstance.current.on('change', (event, items) => {
        setWidgets(prevWidgets => {
          const updatedWidgets = [...prevWidgets];
          items.forEach(item => {
            const index = updatedWidgets.findIndex(w => w.id === item.id);
            if (index !== -1) {
              updatedWidgets[index] = {
                ...updatedWidgets[index],
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
              };
            }
          });
          return updatedWidgets;
        });
      });
    }

    return () => {
      if (gridInstance.current) {
        const nodesToCleanup = [...gridInstance.current.engine.nodes];
        nodesToCleanup.forEach(node => {
          if (node.el) {
            if (node.el.__reactRoot) {
              const rootToUnmount = node.el.__reactRoot;
              delete node.el.__reactRoot;
              setTimeout(() => {
                if (rootToUnmount) {
                  rootToUnmount.unmount();
                }
              }, 0);
            }
            gridInstance.current.removeWidget(node.el, false);
          }
        });
        gridInstance.current.destroy();
        gridInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!gridInstance.current) {
      return;
    }

    const currentGridNodes = gridInstance.current.engine.nodes.map(node => ({
      id: node.id,
      el: node.el
    }));
    const widgetsInState = widgets.map(w => w.id);

    currentGridNodes.forEach(node => {
      if (!widgetsInState.includes(node.id)) {
        if (node.el) {
          if (node.el.__reactRoot) {
            const rootToUnmount = node.el.__reactRoot;
            delete node.el.__reactRoot;
            setTimeout(() => {
              if (rootToUnmount) {
                rootToUnmount.unmount();
              }
            }, 0);
          }
          gridInstance.current.removeWidget(node.el, false);
        }
      }
    });

    widgets.forEach(widget => {
      const existingNode = gridInstance.current.engine.nodes.find(node => node.id === widget.id);

      if (!existingNode) {
        const el = document.createElement("div");
        el.classList.add("grid-stack-item");
        el.setAttribute("gs-id", widget.id);
        el.setAttribute("gs-w", String(widget.w));
        el.setAttribute("gs-h", String(widget.h));
        if (widget.x !== undefined) el.setAttribute("gs-x", String(widget.x));
        if (widget.y !== undefined) el.setAttribute("gs-y", String(widget.y));

        const content = document.createElement("div");
        content.classList.add("grid-stack-item-content");
        el.appendChild(content);

        gridRef.current.appendChild(el);
        gridInstance.current.makeWidget(el);

        el.__reactRoot = ReactDOM.createRoot(content);
        el.__reactRoot.render(
          <WidgetChart
            {...widget}
            onRemove={removeWidget}
            startDate={startDate}
            endDate={endDate}
          />
        );

      } else {
        if (existingNode.el && existingNode.el.__reactRoot) {
          existingNode.el.__reactRoot.render(
            <WidgetChart
              {...widget}
              onRemove={removeWidget}
              startDate={startDate}
              endDate={endDate}
            />
          );
        }
      }
    });
  }, [widgets, removeWidget, startDate, endDate]);

  return(
  <main className="p-6">

    <div className={styles.conteiner}>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Analytics</h1>
        <button className={styles.addModuleButton}>
          <FiPlusCircle />
          <span>Añadir modulo</span>
        </button>
      </div>

      <div className={styles.filterSection}>

        <div className={styles.dateFilter}>
          <FaRegCalendar />
          {/* DatePicker para la fecha de inicio */}

          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            locale="es"
            dateFormat="dd/MM/yyyy"
            className={styles.datePickerInput} // Clase para estilizar
          />
          <IoIosArrowForward />
          {/* DatePicker para la fecha de fin */}

          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate} // La fecha de fin no puede ser anterior a la de inicio
            locale="es"
            dateFormat="dd/MM/yyyy"
            className={styles.datePickerInput} // Clase para estilizar
          />

          <RxCrossCircled className="cursor-pointer" onClick={clearDates} />
          {/* Botón para limpiar fechas */}
        </div>

        <div className={styles.additionalFilter}>

          <div className={styles.filterInput}>
            <TbAdjustmentsFilled />
            <span>Añadir Filtros</span>
          </div>

        </div>

        <p className={styles.filterDescription}>
          Mostrando datos de todos los links y códigos QR
        </p>

      </div>

    </div>

    <div>

      <div className="grid-stack" ref={gridRef}>
        {/* GridStack will manage children directly */}
      </div>

    </div>
    </main>
    );
}
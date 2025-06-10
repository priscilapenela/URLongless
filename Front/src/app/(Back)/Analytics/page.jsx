// app/(Back)/Analytics/page.jsx
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
import WidgetChart from '../../components/WidgetChart'; // Asegúrate de que la ruta sea correcta

export default function AnalyticsPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  // Mantener un estado para los widgets
  const [widgets, setWidgets] = useState([
    { id: "widget-1", chartType: "LineChartMultiple", dataType: "clicks_over_time", w: 3, h: 3 },
    // Puedes añadir más widgets iniciales aquí
  ]);
  const nextWidgetId = useRef(widgets.length + 1); // Para generar IDs únicos

  const addWidget = useCallback(() => {
    const newWidgetId = `widget-${nextWidgetId.current++}`;
    const newWidget = {
      id: newWidgetId,
      chartType: "LineChartMultiple", // Por defecto, se puede cambiar luego
      dataType: "clicks_over_time", // Por defecto, se puede cambiar luego
      w: 3,
      h: 3,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  }, []);

  const removeWidget = useCallback((idToRemove) => {
    if (gridInstance.current) {
        const item = gridInstance.current.engine.nodes.find(node => node.id === idToRemove);
        if (item) {
            gridInstance.current.removeWidget(item.el); // Elimina del GridStack DOM y gestión
        }
    }
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== idToRemove));
  }, []);

  useEffect(() => {
    if (gridRef.current && !gridInstance.current) {
      gridInstance.current = GridStack.init(
        {
          cellHeight: "70px", // Ajusta según tu necesidad para el tamaño de las celdas
          margin: 10,
          float: true,
          // Puedes añadir opciones de Drag-and-drop aquí si quieres algo específico
        },
        gridRef.current
      );

      // Event listener para cuando un widget es removido (ej. desde el botón de cruz)
      gridInstance.current.on('removed', (event, items) => {
        items.forEach(item => {
            // Elimina del estado de React si no se hizo ya a través de removeWidget
            if (widgets.some(w => w.id === item.id)) {
                setWidgets(prevWidgets => prevWidgets.filter(w => w.id !== item.id));
            }
        });
      });

      // Si quieres guardar la posición después de arrastrar/redimensionar
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

    // Limpieza al desmontar el componente
    return () => {
      if (gridInstance.current) {
        gridInstance.current.destroy();
        gridInstance.current = null;
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  // Sincroniza los widgets del estado con GridStack
  useEffect(() => {
    if (gridInstance.current) {
      const currentGridNodes = gridInstance.current.engine.nodes.map(node => node.id);
      const widgetsInState = widgets.map(w => w.id);

      // Remover widgets del GridStack que ya no están en el estado
      currentGridNodes.forEach(nodeId => {
        if (!widgetsInState.includes(nodeId)) {
          const item = gridInstance.current.engine.nodes.find(node => node.id === nodeId);
          if (item) {
            gridInstance.current.removeWidget(item.el, false); // false para no emitir evento 'removed'
          }
        }
      });

      // Añadir o actualizar widgets en GridStack
      widgets.forEach(widget => {
        const existingNode = gridInstance.current.engine.nodes.find(node => node.id === widget.id);
        if (!existingNode) {
          // Crear el elemento DOM y añadirlo a GridStack
          const el = document.createElement("div");
          el.classList.add("grid-stack-item");
          el.setAttribute("gs-id", widget.id); // Importante para GridStack
          el.setAttribute("gs-w", String(widget.w));
          el.setAttribute("gs-h", String(widget.h));
          if (widget.x !== undefined) el.setAttribute("gs-x", String(widget.x));
          if (widget.y !== undefined) el.setAttribute("gs-y", String(widget.y));

          const content = document.createElement("div");
          content.classList.add("grid-stack-item-content");
          el.appendChild(content);

          // Usar gridRef.current para añadir al DOM
          gridRef.current.appendChild(el);
          gridInstance.current.makeWidget(el);

          // Renderizar el componente React
          // Usamos una ref para almacenar los roots y limpiarlos al remover el widget
          el.__reactRoot = ReactDOM.createRoot(content);
          el.__reactRoot.render(<WidgetChart {...widget} onRemove={removeWidget} />);

        } else {
          // Si el widget ya existe, solo actualiza las props si es necesario
          // GridStack manejará las posiciones y tamaños si se actualizan en el estado
          // pero el renderizado de React ya se encargará de las props internas
          // No necesitamos re-renderizar el root aquí si las props cambian,
          // React ya lo gestiona.
          // Solo si cambias la forma en que se construye el elemento DOM de GridStack.
        }
      });
    }
  }, [widgets, removeWidget]); // Se ejecuta cuando 'widgets' cambia

  return (
    <main className="p-6">
      <div className={styles.conteiner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <button className={styles.addModuleButton} onClick={addWidget}>
            <FiPlusCircle />
            <span>Añadir modulo</span>
          </button>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.dateFilter}>
            <FaRegCalendar />
            <span className={styles.dateValue}>03/04/2025</span>
            <IoIosArrowForward />
            <span className={styles.dateValue}>09/04/2025</span>
            <RxCrossCircled />
          </div>
          <div className={styles.additionalFilter}>
            <div className={styles.filterInput}>
              <TbAdjustmentsFilled />
              <span>Añadir Filtros</span>
            </div>
          </div>
          <p className={styles.filterDescription}>Mostrando datos de todos los links y códigos QR</p>
        </div>
      </div>
      <div>
        {/* El div grid-stack ahora solo contendrá los elementos gestionados dinámicamente */}
        <div className="grid-stack" ref={gridRef}>
          {/* Los widgets se añadirán y gestionarán aquí por el useEffect */}
        </div>
      </div>
    </main>
  );
}
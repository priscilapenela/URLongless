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

export default function AnalyticsPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const [widgets, setWidgets] = useState([
    { id: "widget-1", chartType: "LineChartMultiple", dataType: "clicks_over_time", w: 3, h: 3, x: 0, y: 0 },
    { id: "widget-2", chartType: "BarChartVertical", dataType: "referers_analytics", w: 3, h: 3, x: 3, y: 0 },
    { id: "widget-3", chartType: "BubbleChart", dataType: "geo_clicks_bubble", w: 4, h: 4, x: 0, y: 3 },
  ]);
  const nextWidgetId = useRef(widgets.length + 1);

  const addWidget = useCallback(() => {
    const newWidgetId = `widget-${nextWidgetId.current++}`;
    const newWidget = {
      id: newWidgetId,
      chartType: "BarChartVertical",
      dataType: "referers_analytics",
      w: 3,
      h: 3,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
  }, []);

  const removeWidget = useCallback((idToRemove) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== idToRemove));
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

      // Listen for GridStack's internal 'removed' event (e.g., dragged out of grid)
      gridInstance.current.on('removed', (event, items) => {
        items.forEach(item => {
            setWidgets(prevWidgets => {
                const updated = prevWidgets.filter(w => w.id !== item.id);
                // When GridStack removes an item via drag, we need to unmount React root
                if (item.el && item.el.__reactRoot) {
                    const rootToUnmount = item.el.__reactRoot;
                    delete item.el.__reactRoot; // Clear the reference immediately
                    setTimeout(() => { // Defer unmount
                        if (rootToUnmount) {
                            rootToUnmount.unmount();
                        }
                    }, 0);
                }
                return updated;
            });
        });
      });

      // Listen for GridStack's 'change' event (drag/resize)
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

    // Cleanup: Destroy GridStack instance when component unmounts
    return () => {
      if (gridInstance.current) {
        const nodesToCleanup = [...gridInstance.current.engine.nodes];
        nodesToCleanup.forEach(node => {
          if (node.el) {
            // Unmount the React root first
            if (node.el.__reactRoot) {
              const rootToUnmount = node.el.__reactRoot;
              delete node.el.__reactRoot; // Clear the reference immediately
              setTimeout(() => { // Defer unmount
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
  }, []); // Empty dependency array: runs only once on mount

  // Effect 2: Synchronize React state `widgets` with GridStack's DOM and mounted components
  useEffect(() => {
    if (!gridInstance.current) {
        return;
    }

    const currentGridNodes = gridInstance.current.engine.nodes.map(node => ({
        id: node.id,
        el: node.el // Keep reference to the DOM element
    }));
    const widgetsInState = widgets.map(w => w.id);

    // Phase 1: Remove widgets from GridStack (and DOM) that are no longer in React state
    currentGridNodes.forEach(node => {
        if (!widgetsInState.includes(node.id)) {
            if (node.el) {
                // If a React root exists for this GridStack item, unmount it.
                // Defer the unmount call using setTimeout to avoid "synchronously unmount" error.
                if (node.el.__reactRoot) {
                    const rootToUnmount = node.el.__reactRoot;
                    delete node.el.__reactRoot; // Clear the reference immediately

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

    // Phase 2: Add or update widgets in GridStack based on React state
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
        el.__reactRoot.render(<WidgetChart {...widget} onRemove={removeWidget} />);

      } else {
        if (existingNode.el && existingNode.el.__reactRoot) {
          existingNode.el.__reactRoot.render(<WidgetChart {...widget} onRemove={removeWidget} />);
        }
      }
    });
  }, [widgets, removeWidget]);

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
        <div className="grid-stack" ref={gridRef}>
          {/* GridStack will manage children directly */}
        </div>
      </div>
    </main>
  );
}
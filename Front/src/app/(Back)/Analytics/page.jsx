// app/(Back)/Analytics/page.jsx
"use client";
import { useEffect, useRef} from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import styles from "./Analytics.module.css"
import { FiPlusCircle } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { TbAdjustmentsFilled } from "react-icons/tb";

export default function AnalyticsPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);

  useEffect(() => {
    if (gridRef.current && !gridRef.current.classList.contains("gridstack-initialized")) {
      gridInstance.current = GridStack.init({}, gridRef.current);
    }
  }, []);

  const addWidget = () => {
    if (!gridInstance.current) return;

    // Crear el elemento manualmente
    const el = document.createElement("div");
    el.classList.add("grid-stack-item");
    el.setAttribute("gs-w", "4");
    el.setAttribute("gs-h", "2");

    const content = document.createElement("div");
    content.classList.add("grid-stack-item-content");
    content.innerText = `Nuevo Widget`;

    el.appendChild(content);
    gridRef.current.appendChild(el);           // primero lo añadimos al DOM
    gridInstance.current.makeWidget(el);       // luego lo inicializamos con GridStack

  };
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
      <div className="grid-stack" ref={gridRef}></div>
    </div>
    </main>
  );
}

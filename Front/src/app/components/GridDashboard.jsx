"use client";
import { useEffect, useRef, useState } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

export default function GridDashboard() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null); // Guardamos la instancia de GridStack

  useEffect(() => {
    if (gridRef.current && !gridRef.current.classList.contains('gridstack-initialized')) {
      gridInstance.current = GridStack.init({}, gridRef.current);
    }
  }, []);

  const addWidget = () => {
    if (gridInstance.current) {
      gridInstance.current.addWidget(`
        <div class="grid-stack-item" data-gs-w="4" data-gs-h="2">
          <div class="grid-stack-item-content">
            Nuevo Widget
          </div>
        </div>
      `);
    }
  };

  return (
    <div>
      <button onClick={addWidget} style={{ marginBottom: "10px" }}>➕ Añadir Widget</button>
      <div className="grid-stack" ref={gridRef}></div>
    </div>
  );
}



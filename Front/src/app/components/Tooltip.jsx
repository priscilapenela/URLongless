// app/components/Tooltip.jsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";

const TooltipContext = React.createContext(undefined); 

function useTooltipContext(componentName) { 
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error(`Tooltip must be used within a Tooltip Context (used in ${componentName})`);
  }
  return context;
}

const Tooltip = ({ children }) => { // Remueve ': React.FC<{ children: React.ReactNode }>'
  const [tooltip, setTooltip] = React.useState(undefined); // Sin '{ x: number; y: number }'

  return (
    <TooltipContext.Provider value={{ tooltip, setTooltip }}>{children}</TooltipContext.Provider>
  );
};

const TRIGGER_NAME = "TooltipTrigger";

const TooltipTrigger = React.forwardRef( 
  (props, forwardedRef) => {
    const { children } = props;
    const context = useTooltipContext(TRIGGER_NAME);
    const triggerRef = React.useRef(null); 

    React.useEffect(() => {
      const handleClickOutside = (event) => { 
        if (triggerRef.current && !triggerRef.current.contains(event.target)) { 
          context.setTooltip(undefined);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [context]);

    return (
      <g
        ref={(node) => {
          triggerRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") {
            context.setTooltip({ x: event.clientX, y: event.clientY });
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            context.setTooltip(undefined);
          }
        }}
        onTouchStart={(event) => {
          context.setTooltip({ x: event.touches[0].clientX, y: event.touches[0].clientY });
          setTimeout(() => {
            context.setTooltip(undefined);
          }, 2000);
        }}
      >
        {children}
      </g>
    );
  }
);

TooltipTrigger.displayName = TRIGGER_NAME;

const CONTENT_NAME = "TooltipContent";

const TooltipContent = React.forwardRef((props, forwardedRef) => {
  const { children } = props;
  const context = useTooltipContext(CONTENT_NAME);
  const runningOnClient = typeof document !== "undefined";
  const tooltipRef = React.useRef(null);

  const getTooltipPosition = () => {
    if (!tooltipRef.current || !context.tooltip) return {};

    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const willOverflowRight = context.tooltip.x + tooltipWidth + 10 > viewportWidth;
    const willOverflowBottom = context.tooltip.y + tooltipHeight + 10 > viewportHeight;

    return {
      top: willOverflowBottom ? context.tooltip.y - tooltipHeight - 10 : context.tooltip.y + 10,
      left: willOverflowRight ? context.tooltip.x - tooltipWidth - 10 : context.tooltip.x + 10,
    };
  };

  React.useLayoutEffect(() => {
    if (context.tooltip && tooltipRef.current) {
      const updatePosition = () => context.setTooltip({ x: context.tooltip.x, y: context.tooltip.y });
    }
  }, [context.tooltip]);


  if (!context.tooltip || !runningOnClient) {
    return null;
  }

  const isMobile = window.innerWidth < 768;

  return createPortal(
    isMobile ? (
      <div
        className="fixed h-fit z-60 w-fit rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3"
        style={{
          top: context.tooltip.y,
          left: context.tooltip.x + 20,
        }}
      >
        {children}
      </div>
    ) : (
      <div
        ref={tooltipRef}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-sm fixed z-50 pointer-events-none"
        style={getTooltipPosition()}
      >
        {children}
      </div>
    ),
    document.body
  );
});

TooltipContent.displayName = CONTENT_NAME;

export { Tooltip as ClientTooltip, TooltipTrigger, TooltipContent, useTooltipContext };
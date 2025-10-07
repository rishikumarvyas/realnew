import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const InactivityModal: React.FC = () => {
  const { showInactivityWarning, acknowledgeInactivity, logoutNow } = useAuth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Add capture-phase listeners on window to block events before other window
  // handlers run; if the event target is inside the modal we stop propagation.
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const root = rootRef.current;
        if (!root) return;
        const target = ev.target as Node | null;
        if (target && root.contains(target)) {
          if (typeof ev.stopImmediatePropagation === "function")
            ev.stopImmediatePropagation();
          if (typeof ev.stopPropagation === "function") ev.stopPropagation();
          if (typeof ev.preventDefault === "function") ev.preventDefault();
        }
      } catch (e) {
        // ignore
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((ev) => window.addEventListener(ev, handler, true));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler, true));
    };
  }, [showInactivityWarning]);

  if (!showInactivityWarning) return null;

  const stopActivity = (e: React.SyntheticEvent) => {
    // Stop React synthetic propagation and default behavior
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch (err) {
      // ignore
    }

    // Also attempt to stop native event immediate propagation if present
    try {
      const maybeNative = e as unknown as { nativeEvent?: unknown };
      const native = maybeNative.nativeEvent as
        | undefined
        | (Event & {
            stopImmediatePropagation?: () => void;
            stopPropagation?: () => void;
          });
      if (native) {
        if (typeof native.stopImmediatePropagation === "function")
          native.stopImmediatePropagation();
        if (typeof native.stopPropagation === "function")
          native.stopPropagation();
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      ref={rootRef}
      onMouseMove={stopActivity}
      onMouseEnter={() => {
        (
          window as unknown as { __ignoreInactivity?: boolean }
        ).__ignoreInactivity = true;
      }}
      onMouseLeave={() => {
        try {
          delete (window as unknown as { __ignoreInactivity?: boolean })
            .__ignoreInactivity;
        } catch (err) {
          // ignore
        }
      }}
      onMouseDown={stopActivity}
      onTouchStart={stopActivity}
      onScroll={stopActivity}
      onKeyDown={stopActivity}
      tabIndex={-1}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onMouseMove={stopActivity}
        onMouseEnter={() => {
          (
            window as unknown as { __ignoreInactivity?: boolean }
          ).__ignoreInactivity = true;
        }}
        onMouseLeave={() => {
          try {
            delete (window as unknown as { __ignoreInactivity?: boolean })
              .__ignoreInactivity;
          } catch (err) {
            // ignore
          }
        }}
        onMouseDown={stopActivity}
        onTouchStart={stopActivity}
        onScroll={stopActivity}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2">
          You're about to be signed out
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          We haven't detected activity for a while. You'll be signed out soon to
          keep your account secure. Click "Stay signed in" to continue your
          session.
        </p>
        <div className="flex justify-between items-center w-full">
          <Button
            variant="ghost"
            onClick={() => logoutNow()}
            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full"
          >
            Log out now
          </Button>
          <Button
            variant="ghost"
            onClick={() => acknowledgeInactivity()}
            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full"
          >
            Stay signed in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InactivityModal;

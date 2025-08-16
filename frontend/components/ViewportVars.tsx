"use client";

import { useEffect } from "react";

export default function ViewportVars() {
    useEffect(() => {
        const doc = document.documentElement;
        const WebApp = (window as any)?.Telegram?.WebApp;

        const update = () => {
            const h = WebApp?.viewportHeight || window.innerHeight;
            const stableH = WebApp?.viewportStableHeight || h;
            doc.style.setProperty("--tg-viewport-height", h + "px");
            doc.style.setProperty("--tg-viewport-stable-height", stableH + "px");
        };

        update();
        WebApp?.onEvent?.("viewportChanged", update);
        window.addEventListener("resize", update);

        return () => {
            WebApp?.offEvent?.("viewportChanged", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return null;
}

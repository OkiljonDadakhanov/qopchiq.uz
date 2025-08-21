"use client";

import { useEffect } from "react";

export default function ViewportVars() {
    useEffect(() => {
        const doc = document.documentElement;

        const update = () => {
            const h = window.innerHeight;
            const stableH = h;
            doc.style.setProperty("--tg-viewport-height", h + "px");
            doc.style.setProperty("--tg-viewport-stable-height", stableH + "px");
        };

        update();
        window.addEventListener("resize", update);

        return () => {
            window.removeEventListener("resize", update);
        };
    }, []);

    return null;
}

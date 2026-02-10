"use client";
import { useEffect } from "react";

/**
 * ThemeInit reads the saved theme from localStorage and applies/removes
 * the `dark` class on <html>. Include this component once in your layout.
 */
export default function ThemeInit() {
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            document.documentElement.classList.add("dark");
        } else if (saved === "auto") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else {
            // default is light
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return null;
}

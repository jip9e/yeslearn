"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ZoomIn, ZoomOut, Loader2, RotateCcw } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    url: string;
    title?: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Observe container width changes so PDF pages fit inside
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                if (w > 0) setContainerWidth(w);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
        setNumPages(n);
        setLoading(false);
    }, []);

    const onDocumentLoadError = useCallback((err: Error) => {
        setError(err.message || "Failed to load PDF");
        setLoading(false);
    }, []);

    const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2.5));
    const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));
    const resetZoom = () => setScale(1.0);

    // Calculate the width for each page: fit to container with padding, then apply scale
    const pageWidth = containerWidth > 0 ? Math.max((containerWidth - 48) * scale, 200) : undefined;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#f8f7f5] dark:bg-[#111] border-b border-[#e8e5df] dark:border-[#222] shrink-0">
                <div className="flex items-center gap-2 text-[12px] text-[#888]">
                    {numPages > 0 && (
                        <span>{numPages} page{numPages !== 1 ? "s" : ""}</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        className="p-1.5 rounded-lg hover:bg-[#ece9e3] dark:hover:bg-[#222] transition-colors text-[#666] dark:text-[#888]"
                        title="Zoom out"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-[11px] text-[#888] w-10 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-1.5 rounded-lg hover:bg-[#ece9e3] dark:hover:bg-[#222] transition-colors text-[#666] dark:text-[#888]"
                        title="Zoom in"
                    >
                        <ZoomIn size={14} />
                    </button>
                    <button
                        onClick={resetZoom}
                        className="p-1.5 rounded-lg hover:bg-[#ece9e3] dark:hover:bg-[#222] transition-colors text-[#666] dark:text-[#888] ml-1"
                        title="Fit to width"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* PDF Pages */}
            <div ref={containerRef} className="flex-1 overflow-auto bg-[#e8e5df] dark:bg-[#0e0e0e]">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-[#999]" />
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-20 text-[#999]">
                        <p className="text-[14px] mb-1">Could not load PDF</p>
                        <p className="text-[12px]">{error}</p>
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="flex flex-col items-center gap-3 py-4"
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <div
                            key={`page_${index + 1}`}
                            className="shadow-lg bg-white"
                        >
                            <Page
                                pageNumber={index + 1}
                                width={pageWidth}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="select-text"
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}

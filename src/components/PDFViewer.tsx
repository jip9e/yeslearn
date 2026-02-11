"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ZoomIn, ZoomOut, Loader2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "react-intersection-observer";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Constants
const VIEWPORT_BUFFER_PX = 400; // Load pages 400px before they come into view
const A4_ASPECT_RATIO = 1.414; // Standard A4 page ratio
const DEFAULT_MIN_HEIGHT = 600; // Fallback height when width is unknown

interface PDFViewerProps {
    url: string;
    title?: string;
}

// Virtualized page component - only renders when in view
function VirtualPage({ 
    pageNumber, 
    width, 
    scale 
}: { 
    pageNumber: number; 
    width: number | undefined; 
    scale: number;
}) {
    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
        rootMargin: `${VIEWPORT_BUFFER_PX}px 0px`,
    });

    return (
        <div
            ref={ref}
            className="shadow-md bg-white rounded-sm overflow-hidden transition-all duration-200 hover:shadow-lg"
            style={{ minHeight: width ? width * A4_ASPECT_RATIO * scale : DEFAULT_MIN_HEIGHT }}
        >
            {inView ? (
                <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="select-text"
                />
            ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
            )}
        </div>
    );
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSelecting, setIsSelecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // ── Lock scroll while user is selecting text ─────────
    // When a mousedown/touchstart lands on the PDF text layer we freeze
    // the scroll container so dragging to extend the selection doesn't
    // fight with scrolling — especially important on iPad / touch.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isTextLayer = (el: EventTarget | null): boolean => {
            if (!(el instanceof HTMLElement)) return false;
            return (
                el.closest(".react-pdf__Page__textContent") !== null ||
                el.closest(".react-pdf__Page") !== null
            );
        };

        // Only lock scroll once a real text selection appears (not on every touch).
        // This lets normal scroll gestures work unimpeded.
        const lockScroll = () => {
            if (container.style.overflow !== "hidden") {
                container.style.overflow = "hidden";
                container.style.touchAction = "none";
            }
            setIsSelecting(true);
        };

        const unlockScroll = () => {
            if (container.style.overflow === "hidden") {
                container.style.overflow = "auto";
                container.style.touchAction = "";
            }
            setIsSelecting(false);
        };

        // Watch for actual selection forming — lock scroll only then
        const handleSelectionChange = () => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && container.contains(sel.anchorNode)) {
                lockScroll();
            } else if (sel && sel.isCollapsed) {
                unlockScroll();
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);

        // Unlock on mouse/touch up
        const handleMouseUp = () => unlockScroll();
        document.addEventListener("mouseup", handleMouseUp);

        const handleTouchEnd = () => unlockScroll();
        document.addEventListener("touchend", handleTouchEnd);

        // Suppress native context menu on the PDF so our custom toolbar takes over
        const suppressContextMenu = (e: Event) => {
            if (isTextLayer(e.target)) e.preventDefault();
        };
        container.addEventListener("contextmenu", suppressContextMenu);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchend", handleTouchEnd);
            container.removeEventListener("contextmenu", suppressContextMenu);
        };
    }, []);

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

    // Track current page based on scroll position
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const scrollCenter = scrollTop + containerHeight / 2;

            // Find which page is in the center of the viewport
            for (const [pageNum, element] of pageRefs.current.entries()) {
                const rect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const elementTop = rect.top - containerRect.top + scrollTop;
                const elementBottom = elementTop + rect.height;

                if (scrollCenter >= elementTop && scrollCenter <= elementBottom) {
                    setCurrentPage(pageNum);
                    break;
                }
            }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [numPages]);

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

    const goToPage = (page: number) => {
        const element = pageRefs.current.get(page);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const nextPage = () => {
        if (currentPage < numPages) goToPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    };

    // Calculate the width for each page: fit to container with padding, then apply scale
    const pageWidth = containerWidth > 0 ? Math.max((containerWidth - 48) * scale, 200) : undefined;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* Enhanced Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    {numPages > 0 && (
                        <>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                    {currentPage}
                                </span>
                                <span className="text-[11px] text-gray-400">/</span>
                                <span className="text-[13px] text-gray-500 dark:text-gray-400">
                                    {numPages}
                                </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === numPages}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={zoomOut}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                        title="Zoom out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[50px] text-center">
                        <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(scale * 100)}%
                        </span>
                    </div>
                    <button
                        onClick={zoomIn}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                        title="Zoom in"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />
                    <button
                        onClick={resetZoom}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                        title="Reset zoom"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* PDF Pages with Virtual Scrolling */}
            <div 
                ref={containerRef} 
                className="flex-1 overflow-auto bg-gradient-to-br from-[#f5f7fa] to-[#e8ebf0] dark:from-gray-950 dark:to-gray-900"
            >
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <Loader2 size={32} className="animate-spin text-gray-400" />
                        <p className="text-[13px] text-gray-500">Loading PDF...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-[15px] font-medium mb-1">Could not load PDF</p>
                        <p className="text-[13px] text-gray-400">{error}</p>
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="flex flex-col items-center gap-4 py-6 px-4"
                >
                    {Array.from(new Array(numPages), (_, index) => {
                        const pageNum = index + 1;
                        return (
                            <div
                                key={`page_${pageNum}`}
                                ref={(el) => {
                                    if (el) pageRefs.current.set(pageNum, el);
                                    else pageRefs.current.delete(pageNum);
                                }}
                            >
                                <VirtualPage
                                    pageNumber={pageNum}
                                    width={pageWidth}
                                    scale={scale}
                                />
                            </div>
                        );
                    })}
                </Document>
            </div>
        </div>
    );
}

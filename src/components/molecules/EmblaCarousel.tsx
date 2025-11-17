"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function EmblaCarousel({ children }: { children: React.ReactNode }) {
    const [emblaRef, embla] = useEmblaCarousel({ loop: false });
    const [selected, setSelected] = useState(0);
    const [snapCount, setSnapCount] = useState(0);

    useEffect(() => {
        if (!embla) return;
        setSnapCount(embla.slideNodes().length);

        const onSelect = () => setSelected(embla.selectedScrollSnap());
        embla.on("select", onSelect);

        return () => {
            embla.off("select", onSelect);
        };
    }, [embla]);

    const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
    const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);

    return (
        <div className="relative w-full">
            {/* Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 p-2 rounded-full text-white hover:bg-gray-700 transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <button
                onClick={scrollNext}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-gray-900/80 p-2 rounded-full text-white hover:bg-gray-700 transition"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Main Embla */}
            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex gap-4">{children}</div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: snapCount }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => embla?.scrollTo(i)}
                        className={`w-3 h-3 rounded-full transition ${selected === i ? "bg-blue-500" : "bg-gray-500/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

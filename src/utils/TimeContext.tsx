"use client";

import { createContext, ReactNode, useContext } from "react";
import { useTime } from "@/hooks/useFakeTime";

interface TimeProviderProps {
    children: ReactNode;
}

const TimeContext = createContext({
    now: new Date(),
    useFakeTime: false,
});

export function TimeProvider({ children }: TimeProviderProps) {
    const { now, useFakeTime } = useTime();

    return (
        <TimeContext.Provider value={{ now, useFakeTime }}>
            {children}
        </TimeContext.Provider>
    );
}

export function useGlobalTime() {
    return useContext(TimeContext);
}

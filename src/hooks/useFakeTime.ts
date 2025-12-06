"use client";

import { useEffect, useState, useRef } from "react";
import { subscribeFakeTime, FakeTime } from "@/firebase/fakeTime";

export function useTime() {
    const [fakeTimeData, setFakeTimeData] = useState<FakeTime>({
        CustomVnTime: new Date().toISOString(),
        UseFakeTime: false,
    });
    const [now, setNow] = useState<Date>(new Date());

    const lastUpdateRef = useRef(Date.now());
    const fakeBaseRef = useRef(new Date(fakeTimeData.CustomVnTime));

    const parseSafeDate = (s: string) => {
        if (!s) return new Date(NaN);
        const [datePart, timePart] = s.split("T");
        if (!datePart || !timePart) return new Date(NaN);
        const [y, m, d] = datePart.split("-").map((v) => v.padStart(2, "0"));
        return new Date(`${y}-${m}-${d}T${timePart}`);
    };

    useEffect(() => {
        const unsubscribe = subscribeFakeTime((data) => {
            setFakeTimeData(data);
            fakeBaseRef.current = parseSafeDate(data.CustomVnTime);
            lastUpdateRef.current = Date.now();
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(() => {
                if (!fakeTimeData.UseFakeTime) return new Date();
                const delta = Date.now() - lastUpdateRef.current;
                return new Date(fakeBaseRef.current.getTime() + delta);
            });
        }, 200);

        return () => clearInterval(timer);
    }, [fakeTimeData.UseFakeTime]);

    return { now, useFakeTime: fakeTimeData.UseFakeTime };
}

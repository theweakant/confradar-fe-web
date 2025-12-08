import { useGlobalTime } from "@/utils/TimeContext"

export type FileType =
    | "pdf"
    | "word"
    | "excel"
    | "powerpoint"
    | "image"
    | "text"
    | "unknown"


export function getFileTypeFromUrl(url: string): FileType {
    const extension = url.split('.').pop()?.toLowerCase() || ""

    if (extension === "pdf") return "pdf"

    if (["doc", "docx"].includes(extension)) return "word"
    if (["xls", "xlsx"].includes(extension)) return "excel"
    if (["ppt", "pptx"].includes(extension)) return "powerpoint"

    if (["png", "jpg", "jpeg", "gif", "svg", "bmp", "webp"].includes(extension))
        return "image"

    if (["txt", "md", "csv"].includes(extension)) return "text"

    return "unknown"
}

export const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

export const isWithinDateRange = (startDate: string, endDate: string, now: Date = new Date()): boolean => {
    // const { now } = useGlobalTime();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
};

export const steps = [
    { key: "abstractId", label: "Abstract" },
    { key: "fullPaperId", label: "FullPaper" },
    { key: "revisionPaperId", label: "Revise" },
    { key: "cameraReadyId", label: "CameraReady" },
    { key: "paymentId", label: "Payment" },
];
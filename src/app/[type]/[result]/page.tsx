import StatusPage from "@/components/StatusPage/StatusPage";
import Image from "next/image";

export default function Page() {
    return (
        <div className="relative h-screen w-full overflow-hidden">

            <Image
                src="/images/status-page-bg.jpg"
                alt="Background"
                fill
                priority
                className="object-cover scale-105 blur-[0.2px]"
            />

            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            <div className="relative z-10">
                <StatusPage />
            </div>
        </div>
    );
    // return <StatusPage />;
}
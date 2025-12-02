import { useEffect, useState } from "react";
import { requestFirebaseNotificationPermission, onMessageListener } from "@/firebase/messaging";
import { toast } from "sonner";

export const useFirebasePushWeb = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        const initFCM = async () => {
            const token = await requestFirebaseNotificationPermission();
            setFcmToken(token);
        };

        initFCM();

        const unsubscribe = onMessageListener((payload) => {
            console.log("Foreground message received:", payload);

            const title = payload.notification?.title || "Thông báo";
            const body = payload.notification?.body || "";

            toast(`${title}: ${body}`, {
                description: body,
                duration: 5000,
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { fcmToken };
};

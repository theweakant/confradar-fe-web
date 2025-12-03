import { useEffect, useState } from "react";
import { requestFirebaseNotificationPermission, onMessageListener } from "@/firebase/messaging";
import { toast } from "sonner";

export const useFirebasePushWeb = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        const initFCM = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register(
                        '/firebase-messaging-sw.js'
                    );
                    console.log('Service Worker registered:', registration);

                    const token = await requestFirebaseNotificationPermission(registration);
                    console.log('FCM token:', token);
                    setFcmToken(token);
                } catch (err) {
                    console.error('SW registration or FCM init failed:', err);
                }
            } else {
                console.warn('Service Worker not supported in this browser.');
            }
        };
        // const initFCM = async () => {
        //     const token = await requestFirebaseNotificationPermission();
        //     console.log("REQUEST PERMISSION TOKEN:", token);
        //     setFcmToken(token);
        // };

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

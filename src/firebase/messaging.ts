import { getMessaging, getToken, MessagePayload, onMessage } from "firebase/messaging";
import { app } from "./config";

export const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async (registration?: ServiceWorkerRegistration): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: 'BItMdxLQxuoPrXOXdvIf98GiIXDmaU-GuRdpoCcN-dk5PPwyMrxaoFDaFizw14NQ5oWZSL7Msd0_PPcNKHK_eVE',
                serviceWorkerRegistration: registration,
            });
            console.log("FCM Token:", token);
            return token;
        } else {
            console.log("Notification permission denied");
            return null;
        }
    } catch (err) {
        console.error("Error getting FCM token", err);
        return null;
    }
};

export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
    return onMessage(messaging, callback);
};

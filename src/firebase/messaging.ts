import { getMessaging, getToken, MessagePayload, onMessage } from "firebase/messaging";
import { app } from "./config";

export const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async (): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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

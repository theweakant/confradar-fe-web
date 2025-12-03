// src/components/FirebasePushClient.tsx
"use client";

import { useFirebasePushWeb } from "@/hooks/useFirebasePushWeb";

export const FirebasePushClient = () => {
    useFirebasePushWeb();
    return null;
};

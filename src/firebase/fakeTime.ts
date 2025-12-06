import { getDatabase, ref, onValue, get, DataSnapshot } from "firebase/database";
import { app } from "./config";

export const database = getDatabase(app);

export interface FakeTime {
    CustomVnTime: string;
    UseFakeTime: boolean;
}

export function subscribeFakeTime(callback: (data: FakeTime) => void) {
    const fakeTimeRef = ref(database, "fakeTime");
    return onValue(fakeTimeRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val() as FakeTime | null;
        if (data) callback(data);
    });
}

export async function getFakeTime(): Promise<FakeTime> {
    const snapshot = await get(ref(database, "fakeTime"));
    const data = snapshot.val() as FakeTime;
    if (!data) throw new Error("FakeTime not found");
    return data;
}

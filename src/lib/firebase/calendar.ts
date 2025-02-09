import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  CalendarEvent,
  CalendarInfo,
  CalendarDataByEmail,
} from "@/types/calendar";

export const getCalendarDataFromFirestore = async (userId: string) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const querySnapshot = await getDocs(userCalendarsRef);

  const calendarDataByEmail: CalendarDataByEmail = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const email = doc.id;

    calendarDataByEmail[email] = {
      events: data.events || [],
      calendars: data.calendarInfo,
      lastUpdated: data.lastUpdated.toDate(),
    };
  });

  return calendarDataByEmail;
};

export const saveCalendarDataToFirestore = async (
  userId: string,
  email: string,
  data: {
    events: CalendarEvent[];
    calendarInfo: CalendarInfo;
    lastUpdated: Date;
  }
) => {
  console.log("saveCalendarDataToFirestore", userId, email, data);
  if (!userId) {
    throw new Error("userId is required but was not provided");
  }
  if (!email) {
    throw new Error("email is required but was not provided");
  }
  if (!data) {
    throw new Error("calendar data is required but was not provided");
  }

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const calendarDoc = doc(userCalendarsRef, email);

  await setDoc(calendarDoc, {
    events: data.events,
    calendarInfo: data.calendarInfo,
    lastUpdated: data.lastUpdated,
  });
};

export const isDataStale = (lastUpdated: Date) => {
  // 例: 1時間以上経過したデータは古いとみなす
  const ONE_HOUR = 60 * 60 * 1000;
  return Date.now() - lastUpdated.getTime() > ONE_HOUR;
};

export const getCalendarAccounts = async (userId: string) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const snapshot = await getDocs(userCalendarsRef);

  return snapshot.docs.map((doc) => ({
    email: doc.id,
    ...doc.data(),
  }));
};

export const updateCalendarColorInFirestore = async (
  userId: string,
  email: string,
  calendarId: string,
  color: { background: string; foreground: string }
) => {
  if (!userId) throw new Error("userId is required");
  if (!email) throw new Error("email is required");
  if (!calendarId) throw new Error("calendarId is required");
  if (!color) throw new Error("color is required");

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const calendarDoc = doc(userCalendarsRef, email);

  const docSnap = await getDoc(calendarDoc);
  if (!docSnap.exists()) {
    throw new Error("Calendar document not found");
  }

  const currentData = docSnap.data();
  const updatedCalendarInfo = {
    ...currentData.calendarInfo,
    color: color,
  };

  await setDoc(
    calendarDoc,
    {
      ...currentData,
      calendarInfo: updatedCalendarInfo,
    },
    { merge: true }
  );
};

export const subscribeToCalendarUpdates = (
  userId: string,
  callback: (calendarData: CalendarDataByEmail) => void
) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");

  // リアルタイムサブスクリプションを設定
  return onSnapshot(userCalendarsRef, (snapshot) => {
    const calendarDataByEmail: CalendarDataByEmail = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const email = doc.id;

      calendarDataByEmail[email] = {
        events: data.events || [],
        calendars: data.calendarInfo,
        lastUpdated: data.lastUpdated.toDate(),
      };
    });

    callback(calendarDataByEmail);
  });
};

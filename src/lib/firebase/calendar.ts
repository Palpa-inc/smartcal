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
    console.log("userId is required");
    return;
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
    console.log("userId is required but was not provided");
    return;
  }
  if (!email) {
    console.log("email is required but was not provided");
    return;
  }
  if (!data) {
    console.log("calendar data is required but was not provided");
    return;
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
  if (!userId) {
    console.error("userId is required");
    return;
  }
  if (!email) {
    console.error("email is required");
    return;
  }
  if (!calendarId) {
    console.error("calendarId is required");
    return;
  }
  if (!color) throw new Error("color is required");

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const calendarDoc = doc(userCalendarsRef, email);

  const docSnap = await getDoc(calendarDoc);
  if (!docSnap.exists()) {
    console.error("Calendar document not found");
    return;
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

export const updateCalendarDisplayNameInFirestore = async (
  userId: string,
  email: string,
  displayName: string
) => {
  if (!userId) {
    console.error("userId is required");
    return;
  }
  if (!email) {
    console.error("email is required");
    return;
  }
  if (!displayName) throw new Error("displayName is required");

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const calendarDoc = doc(userCalendarsRef, email);

  const docSnap = await getDoc(calendarDoc);
  if (!docSnap.exists()) {
    console.error("Calendar document not found");
    return;
  }

  const currentData = docSnap.data();
  const updatedCalendarInfo = {
    ...currentData.calendarInfo,
    displayName: displayName,
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
    console.error("userId is required");
    return;
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

export const addEventToFirestore = async (
  userId: string,
  email: string,
  newEvent: CalendarEvent
) => {
  if (!userId) throw new Error("userId is required");
  if (!email) throw new Error("email is required");
  if (!newEvent) throw new Error("event is required");

  const userCalendarsRef = collection(db, "calendars", userId, "accounts");
  const calendarDoc = doc(userCalendarsRef, email);

  const docSnap = await getDoc(calendarDoc);
  if (!docSnap.exists()) {
    throw new Error("Calendar document not found");
  }

  const currentData = docSnap.data();
  const updatedEvents = [...(currentData.events || []), newEvent];

  await setDoc(
    calendarDoc,
    {
      ...currentData,
      events: updatedEvents,
      lastUpdated: new Date(),
    },
    { merge: true }
  );
};

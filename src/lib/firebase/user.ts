import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// 非表示キーワードを取得
export const getHideKeywords = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    // console.log("userDoc", userDoc.data());
    return userDoc.data()?.hideKeywords || [];
  } catch (error) {
    console.error("Error getting hide keywords:", error);
    return [];
  }
};

// 非表示キーワードを追加
export const addHideKeyword = async (
  userId: string,
  keyword: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      hideKeywords: arrayUnion(keyword),
    });
  } catch (error) {
    console.error("Error adding hide keyword:", error);
    throw error;
  }
};

// 非表示キーワードを削除
export const removeHideKeyword = async (
  userId: string,
  keyword: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      hideKeywords: arrayRemove(keyword),
    });
  } catch (error) {
    console.error("Error removing hide keyword:", error);
    throw error;
  }
};

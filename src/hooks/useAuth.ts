import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  linkWithPopup,
} from "firebase/auth";
import { doc, setDoc, getFirestore, onSnapshot } from "firebase/firestore";
import { UserData } from "@/types/user";
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideKeywords, setHideKeywords] = useState<string[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
            lastSignInTime: new Date(),
          },
          { merge: true }
        );
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Firestoreのユーザーデータを購読
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        console.log("doc.data()", doc.data());
        setUserData(doc.data() as UserData);
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  useEffect(() => {
    if (userData) {
      console.log("userData", userData);
    }
  }, [userData]);

  // Googleアカウントでログイン
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (user?.isAnonymous) {
        const result = await linkWithPopup(user, provider);
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            isAnonymous: false,
            lastSignInTime: new Date(),
            hidekeywords: [],
          },
          { merge: true }
        );
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      if (
        (error as { code?: string }).code === "auth/credential-already-in-use"
      ) {
        try {
          await signInWithPopup(auth, provider);
        } catch (signInError) {
          console.error("Fallback sign in error:", signInError);
        }
      }
    }
  };

  // 匿名ユーザーでログイン
  const signInAnonymousUser = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign in error:", error);
    }
  };

  // ログアウト
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    userData,
    hideKeywords,
    setHideKeywords,
    loading,
    isAnonymous: user?.isAnonymous ?? false,
    signInWithGoogle,
    signInAnonymousUser,
    signOut,
  };
};

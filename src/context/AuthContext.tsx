import { createContext, useContext, useEffect, useState } from "react";
import {
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { setCookie, deleteCookie } from "../utils/cookies";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
  user: FirebaseAuthUser | null;
  userId: string | null;
  isAuthReady: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signUp: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<void>;
  authError: string | null;
  hasRole: (role: string) => Promise<boolean>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Setting session cookies
        setCookie("session_active", "true", 1);
        setCookie("user_logged_in", "true", 1);
        setCookie("session_start_time", Date.now().toString(), 1);
      } else {

        // Clear login cookie (still keep guest session)
        deleteCookie("user_logged_in");
        deleteCookie("session_start_time");

        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    console.log("signIn called with email:", email, "password:", password);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Set cookies
      setCookie("session_active", "true", 1);
      setCookie("user_logged_in", "true", 1);
      setCookie("session_start_time", Date.now().toString(), 1);

      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      setAuthError(err.message);
      return { success: false };
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, `users/${userCredential.user.uid}`);
      await setDoc(userDocRef, {
        email,
        createdAt: serverTimestamp(),
      });

      // Set cookies
      setCookie("session_active", "true", 1);
      setCookie("user_logged_in", "true", 1);
      setCookie("session_start_time", Date.now().toString(), 1);

      return userCredential;
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setAuthError("Email already in use.");
      } else {
        setAuthError(err.message);
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);

      // Clear cookies
      deleteCookie("session_start_time");
      deleteCookie("session_active");
      deleteCookie("user_logged_in");
    } catch (err: any) {
      console.error("Logout failed:", err);
      setAuthError(err.message);
    }
  };

  // Role-based access control function
  const hasRole = async (role: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || null);
        return userData.role === role;
      }
      return false;
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  };

  const value = { user, userId: user?.uid || null, isAuthReady, signIn, signUp, logOut, authError, hasRole, userRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

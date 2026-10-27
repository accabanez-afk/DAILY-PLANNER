import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { UserProfile, GenderOption, GradeLevel, StrandOption } from '../types';

interface SignUpData {
  name: string;
  email: string;
  password?: string;
  gender: GenderOption;
  address: string;
  grade: GradeLevel;
  strand: StrandOption;
}

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsProfileSetup: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (data: SignUpData) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createGuestProfile: (data: SignUpData) => Promise<void>;
  saveProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'daily_planner_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);

  // Load user profile from Firestore or fallback
  const fetchUserProfile = async (user: User) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data));
        setNeedsProfileSetup(false);
      } else {
        // Check local storage fallback
        const localSaved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed.uid === user.uid) {
              setProfile(parsed);
              // Attempt to save to firestore
              await setDoc(docRef, parsed);
              setNeedsProfileSetup(false);
              return;
            }
          } catch {
            // ignore
          }
        }
        // User logged in via Google but hasn't created full profile yet
        setNeedsProfileSetup(true);
      }
    } catch (err) {
      console.warn('Error fetching user profile from Firestore, checking local storage:', err);
      const localSaved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (parsed.uid === user.uid) {
            setProfile(parsed);
            setNeedsProfileSetup(false);
            return;
          }
        } catch {
          // ignore
        }
      }
      setNeedsProfileSetup(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        // Check if there was a local mock/guest user session
        const local = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.uid?.startsWith('guest_') || parsed.uid?.startsWith('student_')) {
              setProfile(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }
        }
        setProfile(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await fetchUserProfile(res.user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (data: SignUpData) => {
    try {
      if (!data.password) {
        throw new Error('Password is required for sign-up.');
      }
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (res.user) {
        await updateProfile(res.user, { displayName: data.name });
        const newProfile: UserProfile = {
          uid: res.user.uid,
          name: data.name,
          email: data.email,
          gender: data.gender,
          address: data.address,
          grade: data.grade,
          strand: data.strand,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', res.user.uid), newProfile);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `users/${res.user.uid}`);
        }

        setProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
        setNeedsProfileSetup(false);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      // If Firebase email/pass auth is not enabled in the Firebase Console, provide clear fallback
      if (error?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password provider is not enabled in Firebase Console. Please use "Sign in with Google" or continue as Student Profile.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await fetchUserProfile(res.user);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password provider is not enabled in Firebase Console. Please use "Sign in with Google" or create a Student Profile.');
      }
      throw err;
    }
  };

  // Allows instant local/database profile creation when student signs in or prefers direct profile setup
  const createGuestProfile = async (data: SignUpData) => {
    const studentUid = currentUser?.uid || `student_${Date.now()}`;
    const newProfile: UserProfile = {
      uid: studentUid,
      name: data.name,
      email: data.email || currentUser?.email || 'student@dailyplanner.local',
      gender: data.gender,
      address: data.address,
      grade: data.grade,
      strand: data.strand,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
      } catch (err) {
        console.warn('Could not save to firestore, saved locally:', err);
      }
    }

    setProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    setNeedsProfileSetup(false);
  };

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    const targetUid = currentUser?.uid || profile.uid;
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', targetUid), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
      }
    }

    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      if (currentUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    setProfile(null);
    setCurrentUser(null);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        needsProfileSetup,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        createGuestProfile,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


'use client';

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  upgradeGuestAccount: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest: boolean;
  subscription: {
    tier: 'free' | 'premium' | 'family';
    status: 'active' | 'cancelled' | 'expired';
  };
  preferences: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
    cookingSkillLevel: number;
    familySize: number;
  };
  createdAt: any;
  lastActive: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserProfile(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
        
        // Update last active timestamp
        await updateDoc(doc(db, 'users', uid), {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    const userProfileData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData.displayName || 'User',
      photoURL: user.photoURL || '',
      isGuest: user.isAnonymous,
      subscription: {
        tier: 'free',
        status: 'active'
      },
      preferences: {
        dietaryRestrictions: [],
        cuisinePreferences: [],
        cookingSkillLevel: 1,
        familySize: 1,
        ...additionalData.preferences
      },
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      ...additionalData
    };

    await setDoc(doc(db, 'users', user.uid), userProfileData);
    setUserProfile(userProfileData);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      await createUserProfile(user, userData);
      await sendEmailVerification(user);
      
      toast.success('Account created successfully! Please verify your email.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(user);
      }
      
      toast.success('Signed in with Google successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      const { user } = await signInAnonymously(auth);
      await createUserProfile(user, { 
        displayName: 'Guest User',
        isGuest: true 
      });
      toast.success('Welcome, Guest User!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const upgradeGuestAccount = async (email: string, password: string) => {
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user to upgrade');
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      
      await updateDoc(doc(db, 'users', user.uid), {
        email: email,
        isGuest: false,
        upgradedAt: serverTimestamp()
      });
      
      toast.success('Account upgraded successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    upgradeGuestAccount,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

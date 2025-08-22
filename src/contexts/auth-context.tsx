
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
import { useRouter } from 'next/navigation';

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

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest: boolean;
  onboardingCompleted: boolean;
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        await loadUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        
        await updateDoc(userDocRef, { lastActive: serverTimestamp() });

        if (!profile.onboardingCompleted) {
          router.push('/onboarding');
        }

      } else {
        // This case can happen if a user authenticates via a provider (like Google)
        // for the first time.
        await createUserProfile(user);
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Could not load your profile.');
    }
  };

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    const userProfileData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData.displayName || 'New User',
      photoURL: user.photoURL || '',
      isGuest: user.isAnonymous,
      onboardingCompleted: false, // Always false on creation
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
      // Don't send verification here, let Firebase Rules handle it.
      
      toast.success('Account created! Let\'s get you set up.');
      // The useEffect will handle the redirect to /onboarding
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
      const {userCredential} = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      // The useEffect will handle routing based on onboarding status
    } catch (error: any)
    {
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
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(user);
        toast.success('Welcome! Let\'s get you set up.');
      } else {
        toast.success('Signed in with Google successfully!');
      }
      // The useEffect will handle routing
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
      router.push('/login');
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
      {children}
    </AuthContext.Provider>
  );
};

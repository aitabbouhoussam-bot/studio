
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
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  isGuest: boolean;
  onboardingCompleted: boolean;
  familyId?: string | null;
  subscription: {
    tier: 'free' | 'premium' | 'family';
    status: 'active' | 'cancelled' | 'expired';
  };
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    familySize: number;
    dailyCalorieGoal?: number;
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
        // If it's our mock admin user, don't try to load a profile
        if (user.uid === 'admin_user') {
            setUser(user);
            setUserProfile(user.providerData[0] as UserProfile);
        } else {
            setUser(user);
            await loadUserProfile(user);
        }
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

      } else {
        // This case can happen if a user authenticates via a provider (like Google)
        // for the first time or is a new signup.
        await createUserProfile(user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Could not load your profile.');
    }
  };

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    const userProfileData: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || 'New User',
      photoURL: user.photoURL || '',
      isGuest: user.isAnonymous,
      onboardingCompleted: false, // Always false on creation
      familyId: null,
      subscription: {
        tier: 'premium', // Admins/new users can be premium
        status: 'active'
      },
      preferences: {
        dietaryRestrictions: [],
        allergies: [],
        familySize: 1,
      },
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
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
      
      // The user profile will be created by the onAuthStateChanged listener
      // which calls loadUserProfile -> createUserProfile.
      
      toast.success('Account created! Let\'s get you set up.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Admin backdoor for development
    if (email === 'admin@admin.com') {
        console.log("Admin login detected, bypassing Firebase Auth.");
        setLoading(true);
        const adminUser = {
            uid: 'admin_user',
            email: 'admin@admin.com',
            displayName: 'Administrator',
            photoURL: '',
            isAnonymous: false,
            emailVerified: true,
            providerData: [{
                uid: 'admin_user',
                email: 'admin@admin.com',
                displayName: 'Administrator',
                photoURL: '',
                isGuest: false,
                onboardingCompleted: true, // Admins don't need onboarding
                subscription: { tier: 'premium', status: 'active' },
                preferences: { dietaryRestrictions: [], allergies: [], familySize: 1, dailyCalorieGoal: 2000 },
                createdAt: new Date(),
                lastActive: new Date(),
            }]
        } as unknown as User;

        setUser(adminUser);
        setUserProfile(adminUser.providerData[0] as UserProfile);
        toast.success('Signed in as Administrator');
        router.push('/dashboard');
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      // The onAuthStateChanged listener will handle routing
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
      
      await signInWithPopup(auth, provider);
      
      // onAuthStateChanged will handle profile creation/loading and routing
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
      await signInAnonymously(auth);
      toast.success('Welcome, Guest User!');
      // onAuthStateChanged will handle profile creation and routing
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
     if (user.uid === 'admin_user') {
        toast.error("Cannot update mock admin profile.");
        return;
    }

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

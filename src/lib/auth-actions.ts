
'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signUpWithEmailAndPassword(values: z.infer<typeof authSchema>) {
  try {
    const validatedValues = authSchema.parse(values);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      validatedValues.email,
      validatedValues.password
    );

    const user = userCredential.user;

    // Create a user profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.email?.split('@')[0] || 'New User',
        photoURL: '',
        onboardingCompleted: false, // <-- New field
        subscription: {
          tier: 'free',
          status: 'active',
        },
        createdAt: new Date().toISOString(),
    });
    
    return { success: true, userId: user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signInWithEmailAndPasswordAction(values: z.infer<typeof authSchema>) {
    try {
        const validatedValues = authSchema.parse(values);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          validatedValues.email,
          validatedValues.password
        );
        return { success: true, userId: userCredential.user.uid };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

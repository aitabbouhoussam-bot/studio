
'use server';

import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
    
    return { success: true, userId: userCredential.user.uid };
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

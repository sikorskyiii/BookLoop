import { auth } from '../../lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

export const observeAuth = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

export async function emailSignUp(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export async function emailSignIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}


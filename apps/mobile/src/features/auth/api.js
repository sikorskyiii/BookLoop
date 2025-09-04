import { auth } from '../../lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const observeAuth = (cb) => onAuthStateChanged(auth, cb);

export async function emailSignUp(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export async function emailSignIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logout() {
  await signOut(auth);
}

import { auth } from './config';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth';

export async function signInWithGoogle(idToken: string, accessToken?: string) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  return signInWithCredential(auth, credential);
}

export async function signInWithApple(idToken: string, rawNonce: string) {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken, rawNonce });
  return signInWithCredential(auth, credential);
}

export function signOut() {
  return fbSignOut(auth);
}

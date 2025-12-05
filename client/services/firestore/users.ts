import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { User } from "firebase/auth";
import { UserRole } from "@/lib/permissions";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DEFAULT_ROLE: UserRole = "owner";

const isValidRole = (role: unknown): role is UserRole =>
  role === "owner" || role === "admin" || role === "manager" || role === "employee";

// Créer ou mettre à jour le profil utilisateur dans Firestore
export async function createOrUpdateUserProfile(user: User): Promise<UserRole> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, "users", user.uid);
  
  // Vérifier si l'utilisateur existe déjà
  const userSnap = await getDoc(userRef);
  
  const now = Timestamp.now();
  const existingRole = userSnap.exists() ? (userSnap.data()?.role as UserRole | undefined) : undefined;
  const roleToPersist = isValidRole(existingRole) ? existingRole : DEFAULT_ROLE;
  
  if (!userSnap.exists()) {
    // Créer un nouveau profil utilisateur
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: roleToPersist,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Profil utilisateur créé dans Firestore:", user.uid);
  } else {
    // Mettre à jour le profil existant
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: roleToPersist,
      updatedAt: now,
    }, { merge: true });
    console.log("Profil utilisateur mis à jour dans Firestore:", user.uid);
  }

  // Synchroniser le rôle en local pour usage immédiat
  localStorage.setItem("bartender-user-role", roleToPersist);

  return roleToPersist;
}

// Obtenir le profil utilisateur depuis Firestore
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  
  return userSnap.data() as UserProfile;
}

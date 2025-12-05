import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreProduct as Product } from "@shared/firestore-schema";

// Chemin: users/{userId}/products/{productId}

// Obtenir tous les produits d'un utilisateur
export async function getProducts(userId: string): Promise<Product[]> {
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  const q = query(productsRef, orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

// Obtenir un produit par ID
export async function getProduct(userId: string, productId: string): Promise<Product | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
}

// Créer un produit
export async function createProduct(
  userId: string,
  product: Omit<Product, "id">
): Promise<Product> {
  console.log("=== createProduct appelé ===");
  console.log("userId:", userId);
  console.log("product:", product);
  console.log("db initialized:", !!db);
  
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  console.log("Collection path:", `users/${userId}/products`);
  
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  console.log("Document créé avec ID:", docRef.id);

  return {
    id: docRef.id,
    ...product,
  } as Product;
}

// Mettre à jour un produit
export async function updateProduct(
  userId: string,
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    // Si le document n'existe pas, essayons juste de logger l'erreur mais ne pas crasher
    console.warn(`[Products] Impossible de mettre à jour ${productId}:`, error.message);
    // Ne pas relancer l'erreur pour ne pas interrompre le flux de paiement
  }
}

// Supprimer un produit
export async function deleteProduct(userId: string, productId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  await deleteDoc(docRef);
}

// Rechercher des produits par catégorie
export async function getProductsByCategory(
  userId: string,
  category: string
): Promise<Product[]> {
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  const q = query(
    productsRef,
    where("category", "==", category),
    orderBy("name")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

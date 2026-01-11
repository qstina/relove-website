// CartContext.tsx (or .jsx)
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import React, { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from "react";

// Define the item type (adjust to match your actual product type)
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  removeItemsFromCartState: (ids: string[]) => void; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  console.log("DB ready:", db);

  const [cart, setCart] = useState<CartItem[]>([]);
  
  const removeItemsFromCartState = (ids: string[]) => {
    setCart((currentCart) => currentCart.filter(item => !ids.includes(item.id)));
  };


  // 🔹 1. Clear cart when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCart([]);
        console.log("User logged out, cart cleared");
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 2. Load cart for the logged-in user
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setCart([]);
      return;
    }

    const snapshot = await getDocs(
      collection(db, "Cart", user.uid, "cartItems")
    );

    const validItems: CartItem[] = [];

    for (const cartDoc of snapshot.docs) {
      const cartItem = cartDoc.data();

      // 🔍 NEW PART — check Items collection
      const itemRef = doc(db, "Items", cartDoc.id);
      const itemSnap = await getDoc(itemRef);

      const itemData = itemSnap.data();
      if (!itemSnap.exists() || itemData?.sold === true) {
        await deleteDoc(doc(db, "Cart", user.uid, "cartItems", cartDoc.id));
        continue;
      }

      // ✅ Keep only valid items
      validItems.push({
        id: cartDoc.id,
        name: cartItem.name,
        price: cartItem.price,
        image: cartItem.image,
      });
    }

    setCart(validItems);
  });

  return () => unsubscribe();
}, []);


  // 🔹 3. Add item to cart
  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    setCart((currentCart) => {
      const exists = currentCart.some(
        (cartItem) => cartItem.id === item.id
      );
      if (exists) return currentCart;

      return [...currentCart, { ...item, quantity: 1 }];
    });

    await setDoc(
      doc(db, "Cart", user.uid, "cartItems", item.id),
      {
        name: item.name,
        price: item.price,
        image: item.image,
      }
    );
  };

  // 🔹 Remove item from cart
// 🔹 Remove item from cart (CORRECT LOGIC)
const removeFromCart = async (productId: string) => {
  const user = auth.currentUser;
  if (!user) return;

  setCart((currentCart) =>
    currentCart.filter((item) => item.id !== productId)
  );

  await deleteDoc(
    doc(db, "Cart", user.uid, "cartItems", productId)
  );
};

// 🔹 Clear entire cart
// 🔹 Clear entire cart (CORRECT + COMPLETE)
const clearCart = async () => {
  const user = auth.currentUser;
  if (!user) return;

  // 1️⃣ Get all cart items from Firestore
  const snapshot = await getDocs(
    collection(db, "Cart", user.uid, "cartItems")
  );

  // 2️⃣ Delete each item
  const deletePromises = snapshot.docs.map((docSnap) =>
    deleteDoc(docSnap.ref)
  );

  await Promise.all(deletePromises);

  // 3️⃣ Clear local state
  setCart([]);

  console.log("All cart items deleted");
};



  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        removeItemsFromCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context as CartContextType;
};
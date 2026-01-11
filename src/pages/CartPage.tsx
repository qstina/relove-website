// CartPage.tsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const visibleCart = cart.filter((item: any) => item.sold !== true);

  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedCartItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev: string[]) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const proceedToCheckout = () => {
    // 🔍 DEBUG: Check your console to see what 'user' actually is
    console.log("Attempting checkout. Current User:", user);

    // ✅ STRICT GATEKEEPER:
    // 1. Check if user is null/undefined
    // 2. Check if user has no email (filters out anonymous/guest users or empty objects)
    if (!user || !user.email) {
      alert("Please log in or register to proceed to checkout.");
      navigate("/login");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one item to checkout.");
      return;
    }

    const itemsToCheckout = cart.filter((item) => selectedItems.includes(item.id));
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout));
    setError("");
    navigate("/checkout");
  };

  const totalSelected = visibleCart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center" style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}>
          🛒 Your Cart
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-700 text-lg">Your cart is currently empty. Start adding some items!</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {visibleCart.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" checked={selectedItems.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 text-[#A87A6F] border-gray-300 rounded" />
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl border" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-gray-600">RM {product.price}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-6">
              <h3 className="text-xl font-bold text-gray-800">Total: RM {totalSelected}</h3>
              <button onClick={clearCart} className="bg-[#5a19ad] text-white px-5 py-2 rounded-xl hover:bg-[#A087C7] transition">Clear Cart</button>
            </div>

            <div className="flex flex-col items-end mt-6 space-y-2">
              <button onClick={proceedToCheckout} className="bg-[#5a19ad] text-white px-5 py-2 rounded-xl hover:bg-[#A087C7] transition">
                Proceed to Checkout
              </button>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
// Checkout.tsx
import { useState, useEffect } from "react";
import type { CartItem } from "../context/CartContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { removeFromCart } = useCart();

  // 1️⃣ ROUTE GUARD: Redirect if user is not fully authenticated (must have email)
  useEffect(() => {
    if (!user || !user.email) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Form State
  const [form, setForm] = useState({
    address: "", payment: "", shipping: "", bank: "",
    cardNumber: "", cardName: "", expiry: "", cvv: ""
  });

  // Load user address
  useEffect(() => {
    // Only try to fetch address if we have a valid user UID
    if (!user?.uid) return;

    const fetchUserAddress = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm((prev) => ({ ...prev, address: docSnap.data().address || "" }));
        }
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };
    fetchUserAddress();
  }, [user]);

  // 2️⃣ BLOCK UI RENDERING
  // If user is missing or has no email, show loader (or nothing)
  if (!user || !user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a19ad] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying account...</p>
        </div>
      </div>
    );
  }

  // --- Safe to render form now ---
  const checkoutItems: CartItem[] = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
  const totalPrice = checkoutItems.reduce((total, item) => total + item.price, 0).toFixed(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const orderItems = await Promise.all(
        checkoutItems.map(async (item) => {
          const docSnap = await getDoc(doc(db, "Items", item.id));
          return { ...item, sellerEmail: docSnap.data()?.sellerEmail || "", orderId: "" };
        })
      );

      const orderRef = await addDoc(collection(db, "Orders"), {
        userId: user.uid,
        email: user.email,
        items: orderItems,
        totalAmount: totalPrice,
        status: "Processing",
        createdAt: serverTimestamp(),
        ...form
      });

      for (const item of checkoutItems) {
        await updateDoc(doc(db, "Items", item.id), { sold: true, orderStatus: "paid", orderId: orderRef.id });
      }

      await Promise.all(checkoutItems.map((item) => removeFromCart(item.id)));
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("selectedCartItems");

      navigate("/payment-processing", { state: { totalPayment: totalPrice, paymentMethod: form.payment, bank: form.bank } });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center mb-8 border-b-4 border-[#5a19ad] pb-2 justify-center relative">
          <button onClick={() => navigate("/cart")} className="absolute left-0 text-[#5a19ad] hover:text-[#A087C7] font-semibold flex items-center">
             Back to Cart
          </button>
          <h2 className="font-primary text-4xl font-bold text-[#333333]">🧾 Checkout</h2>
        </div>

        {checkoutItems.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-6">
              {checkoutItems.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl border" />
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-600">RM {product.price}</p>
                    </div>
                  </div>
                  <p className="font-medium">RM {(product.price).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mb-6">
              <h3 className="text-xl font-bold">Total: RM {totalPrice}</h3>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Delivery Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required />
          </div>

          <div>
            <label className="block mb-2 font-medium">Payment Method</label>
            <select name="payment" value={form.payment} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required>
              <option value="">Select payment method</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Online Banking">Online Banking</option>
            </select>
          </div>

          {form.payment === "Online Banking" && (
            <div className="animate-fadeIn">
              <label className="block mb-2 font-medium">Select Bank</label>
              <select name="bank" value={form.bank} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required>
                <option value="">Choose your bank</option>
                <option value="maybank">Maybank</option>
                <option value="cimb">CIMB</option>
                <option value="rhb">RHB</option>
                <option value="hongleong">Hong Leong</option>
                <option value="bankislam">Bank Islam</option>
                <option value="publicbank">Public Bank</option>
              </select>
            </div>
          )}

          {form.payment === "Credit / Debit Card" && (
            <div className="space-y-4 animate-fadeIn">
              <label className="block font-medium">Card Information</label>
              <input type="text" name="cardNumber" placeholder="Card Number" value={form.cardNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required />
              <input type="text" name="cardName" placeholder="Name on Card" value={form.cardName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required />
              <div className="flex space-x-4">
                <input type="text" name="expiry" placeholder="MM/YY" value={form.expiry} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required />
                <input type="text" name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Shipping Option</label>
            <select name="shipping" value={form.shipping} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" required>
              <option value="">Select shipping option</option>
              <option value="standard">Standard (3–5 days)</option>
              <option value="express">Express (1–2 days)</option>
              <option value="f2f">Face-to-Face Meetup</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-[#5a19ad] text-white py-3 rounded-xl hover:bg-[#A087C7] transition font-semibold">
            Confirm Order
          </button>
        </form>
      </div>
    </div>
  );
}
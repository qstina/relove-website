import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase.config";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ApplySeller: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(true);

  // Fetch user profile & check if already applied
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Check if user has applied
        const querySnapshot = await getDocs(collection(db, "sellerApplications"));
        const existingApp = querySnapshot.docs.find((doc) => doc.data().userId === user.uid);
        if (existingApp) setHasApplied(true);

        // Pre-fill phone & address from user profile
        const userDoc = await getDocs(collection(db, "users"));
        const currentUserData = userDoc.docs.find((doc) => doc.id === user.uid)?.data();
        if (currentUserData) {
          setPhone(currentUserData.phone || "");
          setAddress(currentUserData.address || "");
          setAccountNumber(currentUserData.accountNumber || "");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingApplication(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !address) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "sellerApplications"), {
        userId: user.uid,
        email: user.email,
        phone,
        address,
        accountNumber,
        description,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Application submitted successfully!");
      setHasApplied(true); // prevent multiple submissions
      navigate("/profile");
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingApplication) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 relative">
      <div className="container mx-auto px-4 lg:px-8 max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2
          className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
        >
          🏷️ Apply to be a Seller
        </h2>

        {hasApplied ? (
          <p className="text-center text-gray-600">
            ✅ You have already submitted a seller application.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Why you want to become a seller?
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5a19ad] text-white py-3 rounded-lg hover:bg-[#A087C7]"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    )}
  </div>
</div>
  );
};

export default ApplySeller;

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate, useLocation } from "react-router-dom";


const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { defaultTab?: string };
  const initialTab = locationState?.defaultTab || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    email: "",
    address: "",
    course: "",
    phone: "",
    role: "",
    city: "",
    postcode: "",
    state: "",
  });
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
    course: "",
    phone: "",
    role: "",
    city: "Gelugor",
    postcode: "07708",
    state: "Penang",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [listedItems, setListedItems] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  const malaysianStates = [
    "Johor","Kedah","Kelantan","Kuala Lumpur","Labuan","Malacca",
    "Negeri Sembilan","Pahang","Penang","Perak","Perlis","Putrajaya",
    "Sabah","Sarawak","Selangor","Terengganu"
  ];

  const handleEditItem = (id: string) => {
    const item = listedItems.find(i => i.id === id);
    if (item) {
      navigate(`/edit-listing/${item.id}`, {
  state: { item }
});
    } else {
      alert("Item data not found");
    }
  };

  const handleDeleteItem = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  try {
    await updateDoc(doc(db, "Items", id), {
      deletedAt: serverTimestamp(),
      sold: true,
    });

    setListedItems(prev => prev.filter(item => item.id !== id));
    alert("Item deleted successfully.");
  } catch (err) {
    console.error("Error deleting item:", err);
    alert("Failed to delete item.");
  }
};


  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const userProfile = {
              name: data.name || "",
              email: data.email || "",
              address: data.address || "",
              course: data.course || "",
              phone: data.phone || "",
              role: data.role || "buyer",
              city: data.role === "Seller" ? "Gelugor" : (data.city || ""),
              postcode: data.role === "Seller" ? "07708" : (data.postcode || ""),
              state: data.role === "Seller" ? "Penang" : (data.state || ""),
            };
            setOriginalProfile(userProfile);
            setProfile(userProfile);
          } else {
            const userProfile = {
              name: user.displayName || "",
              email: user.email || "",
              address: "",
              course: "",
              phone: "",
              role: "buyer",
              city: "Gelugor",
              postcode: "07708",
              state: "Penang",
            };
            await setDoc(docRef, { ...userProfile, createdAt: serverTimestamp() });
            setOriginalProfile(userProfile);
            setProfile(userProfile);
          }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
fetchProfile();
}, [user]);

  // Fetch seller applications for Admin
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || profile.role !== "Admin") {
        setLoadingApplications(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "sellerApplications"));
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [user, profile.role]);

  const handleApprove = async (id: string, userId: string) => {
    try {
      await updateDoc(doc(db, "sellerApplications", id), { status: "approved" });
      await updateDoc(doc(db, "users", userId), { role: "Seller" });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
      alert("Application approved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to approve application.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "sellerApplications", id), { status: "rejected" });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
      alert("Application rejected.");
    } catch (err) {
      console.error(err);
      alert("Failed to reject application.");
    }
  };

  const handleUpdateTracking = async (
    orderId: string,
    trackingNumber: string
  ) => {
    if (!trackingNumber.trim()) {
      alert("Please enter tracking number");
      return;
    }

    try {
      await updateDoc(doc(db, "Orders", orderId), {
        trackingNumber,
        status: "Shipping",
        updatedAt: serverTimestamp(),
      });

      setSellerOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, trackingNumber, status: "Shipping" }
            : order
        )
      );

      alert("Tracking updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update tracking");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "Orders", orderId), {
        status: "Delivered",
        updatedAt: serverTimestamp(),
      });

      setSellerOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: "Delivered" } : order
        )
      );

      alert("Order marked as delivered!");
    } catch (err) {
      console.error(err);
      alert("Failed to mark order as delivered.");
    }
  };

  useEffect(() => {
  const fetchListedItems = async () => {
    if (!user || !user.email) {
      setLoadingItems(false);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "Items"));

      const items = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.itemName,
            image: data.itemImageURL,
            description: data.itemDesc,
            price: data.price,
            category: data.itemCategory,
            condition: data.condition ?? 1,
            sellerEmail: data.sellerEmail,
            orderStatus: data.orderStatus ?? null,
            sold: data.sold ?? false,
            listedAt: data.createdAt?.toDate?.() || null,
          };
        })
        // ✅ FILTER BY EMAIL
        .filter(item => item.sellerEmail === user.email);

      setListedItems(items);
    } catch (err) {
      console.error("Error fetching listed items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  fetchListedItems();
}, [user]);


  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.email) {
        setLoadingOrders(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "Orders"));

        const myOrders = snapshot.docs
          .map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              email: data.email,
              date: data.createdAt?.toDate?.().toLocaleDateString() || "—",
              status: data.status || "Processing",
              tracking: data.trackingNumber || "Seller is preparing to ship your order",
              total: data.totalAmount || 0,
              items: data.items || [],
            };
          })
          // ✅ ONLY filter you need
          .filter(order => order.email === user.email);

        setOrders(myOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [loadingSellerOrders, setLoadingSellerOrders] = useState(true);

  // Fetch Order for Seller
  useEffect(() => {
    const fetchSellerOrders = async () => {
      if (!user || profile.role !== "Seller") {
        setLoadingSellerOrders(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "Orders"));

        const ordersForSeller = snapshot.docs
          .map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              status: data.status || "Processing",
              trackingNumber: data.trackingNumber || "",
              items: data.items || [],
              buyerEmail: data.email || "",
              buyerAddress: data.address || "",
              buyerPaymentMethod: data.payment || "",
              buyerBank: data.bank || "", // if applicable
              buyerShipping: data.shipping || "",
            };
          })
          .filter(order =>
            order.items.some((item: any) => item.sellerEmail === user.email)
          );

      setSellerOrders(ordersForSeller);

      setTrackingInputs(
        ordersForSeller.reduce((acc, order) => {
          acc[order.id] = order.trackingNumber || "";
          return acc;
        }, {} as { [orderId: string]: string })
      );

      } catch (err) {
        console.error("Error fetching seller orders:", err);
      } finally {
        setLoadingSellerOrders(false);
      }
    };

    fetchSellerOrders();
  }, [user, profile.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile.name.trim() || !profile.address.trim() || !profile.course.trim() || !profile.phone.trim()) {
      alert("All fields are required. Please fill in all information.");
      return;
    }

    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
      setOriginalProfile(profile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Shipping": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return <p className="text-center mt-10">Please log in to view your profile.</p>;
  if (loadingProfile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#5a19ad] to-[#A087C7] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#333333]">{profile.name || "User"}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-[#5a19ad] text-white text-sm rounded-full font-semibold">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === "profile"
                  ? "bg-[#5a19ad] text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              👤 My Profile
            </button>

            {/* Only show other tabs if not Admin */}
            {profile.role !== "Admin" && (
              <>
                <button
                  onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === "orders"
                  ? "bg-[#5a19ad] text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
                >
                  📦 My Orders
                </button>
                {/* Hide My Listings tab for buyers */}
                {profile.role === "Seller" && (
                  <button
                    onClick={() => setActiveTab("listings")}
                    className={`flex-1 py-4 px-6 font-semibold transition ${
                      activeTab === "listings"
                        ? "bg-[#5a19ad] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🏷️ My Listings
                  </button>
                )}
                {profile.role === "Admin" && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`flex-1 py-4 px-6 font-semibold transition ${
                      activeTab === "admin"
                        ? "bg-[#B19CD9] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🛠️ Admin
                  </button>
                )}
              </>
            )}
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#333333]">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="px-6 py-2 bg-[#5a19ad] text-white rounded-xl hover:bg-[#A087C7] transition font-semibold"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="w-full border rounded-xl p-3 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Course</label>
                      <input
                        type="text"
                        name="course"
                        value={profile.course}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={profile.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Postcode</label>
                      <input
                        type="text"
                        name="postcode"
                        value={profile.postcode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">State</label>
                      <select
                        name="state"
                        value={profile.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                      >
                        <option value="">Select state</option>
                        {malaysianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={profile.role}
                        disabled
                        className="w-full border rounded-xl p-3 bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Apply to be Seller */}
                  {profile.role === "Buyer" && !isEditing && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-[#5a19ad] to-[#A087C7] rounded-2xl text-center">
                      <h3 className="text-white text-xl font-bold mb-2">Want to sell your items?</h3>
                      <p className="text-white/90 mb-4">Apply to become a seller and start listing your products!</p>
                      <button
                        onClick={() => navigate("/apply-seller")}
                        className="bg-white text-[#5a19ad] px-6 py-3 rounded-xl hover:bg-gray-100 transition font-semibold"
                      >
                        Apply to be a Seller
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-[#5a19ad] text-white py-3 rounded-xl hover:bg-[#A087C7] transition font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && profile.role !== "Admin" && (
              <div>
                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p>You have no orders yet.</p>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-2xl p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Order {order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Date: {order.date}</p>
                        <p className="text-sm text-gray-500 mb-2">Tracking: {order.tracking}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-4">
                              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-gray-500">Qty: {item.quantity}</p>
                                <p className="text-gray-500">Price: RM {(item.price / 100).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-right font-semibold mt-4">Total: RM{order.total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && profile.role !== "Admin" && (
              <div>
                {loadingItems ? (
                  <p>Loading your listings...</p>
                ) : listedItems.length === 0 ? (
                  <p>You have no listed items yet.</p>
                ) : (
                  <div className="space-y-10">

                    {/* Available Items */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-[#5a19ad]">Available Items</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listedItems.filter(item => !item.sold && item.orderStatus !== "paid").length === 0 ? (
                          <div className="col-span-full text-center text-gray-400 p-10 border border-gray-300 rounded-xl">
                            <p className="mb-4 text-lg font-semibold">No Available Items</p>
                            <button
                              onClick={() => navigate("/listing")}
                              className="bg-[#5a19ad] text-white px-6 py-3 rounded-xl hover:bg-[#A087C7] transition font-semibold"
                            >
                              Sell an Item
                            </button>
                          </div>
                        ) : (
                          listedItems.filter(item => !item.sold && item.orderStatus !== "paid").map((item) => {
                            const hideDescriptionItems = [
                              "Engineering Textbook Set",
                              "Student Laptop",
                              "Campus Backpack"
                            ];
                            const hideDescription = hideDescriptionItems.includes(item.name);

                            const isStudentLaptop = item.name === "Student Laptop";

                            return (
                              <div
  key={item.id}
  className="relative bg-white rounded-2xl shadow p-4 flex flex-col h-full min-h-[460px]"
>
  {/* CONTENT */}
  <div className="flex-grow">
    <img
      src={item.image}
      alt={item.name}
      className="w-full h-40 object-cover rounded-xl mb-4"
    />

    <h3 className="font-semibold text-lg">{item.name}</h3>

    {!hideDescription && (
      <p className="text-gray-500 text-sm">{item.description}</p>
    )}

    <p className="text-sm text-gray-600 mt-1">
      Category: <span className="font-medium">{item.category}</span>
    </p>

    <p className="text-sm text-gray-600 mt-1">
      Condition: <span className="font-medium">{item.condition}/10</span>
    </p>

    <p className="mt-2 font-semibold">RM{item.price}</p>
  </div>

  {/* BUTTONS (STICK TO BOTTOM) */}
  {!isStudentLaptop && (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => handleEditItem(item.id)}
        className="flex-1 px-4 py-2 bg-[#5a19ad] text-white rounded-xl hover:bg-[#A087C7] transition font-semibold"
      >
        Edit
      </button>

      <button
        onClick={() => handleDeleteItem(item.id)}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
      >
        Delete
      </button>
    </div>
  )}
</div>

                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Ordered and Paid Items */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-green-600">Ordered and Paid Items</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingSellerOrders ? (
                          <p>Loading orders...</p>
                        ) : sellerOrders.length === 0 ? (
                          <p>No paid orders yet.</p>
                        ) : (
                          <div className="space-y-6">
                            {sellerOrders.map(order => (
                              <div key={order.id} className="border rounded-xl p-4 bg-gray-50">
                                <p className="font-semibold mb-2">Order ID: {order.id}</p>
                                <p className="text-sm mb-2">Status: {order.status}</p>
                                {order.items
                                  .filter((item: any) => item.sellerEmail === profile.email)
                                  .map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 mb-3">
                                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                                      <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">RM {item.price}</p>
                                      </div>
                                    </div>
                                ))}

                                {/* Buyer Info */}
                                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                                  <p className="text-sm"><span className="font-semibold">Buyer Email:</span> {order.buyerEmail}</p>
                                  <p className="text-sm"><span className="font-semibold">Payment Method:</span> {order.buyerPaymentMethod}</p>
                                  {order.buyerPaymentMethod === "Online Banking" && (
                                    <p className="text-sm"><span className="font-semibold">Bank:</span> {order.buyerBank}</p>
                                  )}
                                  <p className="text-sm"><span className="font-semibold">Delivery Address:</span> {order.buyerAddress}</p>
                                  <p className="text-sm"><span className="font-semibold">Shipping Option:</span> {order.buyerShipping}</p>
                                </div>

                                {!order.trackingNumber ? (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Enter tracking number"
                                      value={trackingInputs[order.id] || ""}
                                      onChange={(e) =>
                                        setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))
                                      }
                                      className="flex-1 border rounded-lg p-2"
                                    />
                                    <button
                                      onClick={() => handleUpdateTracking(order.id, trackingInputs[order.id])}
                                      className="px-4 py-2 bg-[#5a19ad] text-white rounded-lg hover:bg-[#A087C7] transition"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <p className="mt-2 font-medium text-gray-700">
                                    Tracking Number: {order.trackingNumber}
                                  </p>
                                )}

                                {/* Mark as Delivered Button */}
                                {order.status === "Shipping" && (
                                  <button
                                    onClick={() => handleMarkDelivered(order.id)}
                                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                                  >
                                    Mark as Delivered
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sold Items */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-red-600">Sold Items</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listedItems.filter(item => item.sold).map((item) => {
                          const hideDescriptionItems = [
                            "Engineering Textbook Set",
                            "Student Laptop",
                            "Campus Backpack"
                          ];
                          const hideDescription = hideDescriptionItems.includes(item.name);

                          return (
                            <div key={item.id} className="relative bg-white rounded-2xl shadow p-4">
                              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                                Sold
                              </div>
                              <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              {!hideDescription && <p className="text-gray-500 text-sm">{item.description}</p>}
                              <p className="text-sm text-gray-600 mt-1">Category: <span className="font-medium">{item.category}</span></p>
                              <p className="text-sm text-gray-600 mt-1">Condition: <span className="font-medium">{item.condition}/10</span></p>
                              <p className="mt-2 font-semibold">RM{item.price}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === "admin" && profile.role === "Admin" && (
              <div>
                {loadingApplications ? (
                  <p>Loading applications...</p>
                ) : applications.length === 0 ? (
                  <p>No seller applications yet.</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border p-4 rounded-xl bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{app.name}</p>
                          <p className="text-gray-500 text-sm">Email: {app.email}</p>
                          <p className="text-gray-500 text-sm">Status: {app.status}</p>
                        </div>
                        <div className="flex space-x-2">
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id, app.userId)}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

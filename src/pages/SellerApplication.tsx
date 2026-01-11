import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";

const SellerApplication: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const snapshot = await getDocs(collection(db, "sellerApplications"));
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

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

  if (!user) return <p className="text-center mt-10">Please log in to view this page.</p>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          <h2
            className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
            style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
          >
            📝 Seller Applications
          </h2>

          {loading ? (
            <p className="text-gray-700 text-lg text-center">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-gray-700 text-lg text-center py-12">No pending applications.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#5a19ad] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-tl-xl">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {applications.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`border-b hover:bg-gray-50 transition ${
                        index === applications.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-4 py-3">{app.name || "-"}</td>
                      <td className="px-4 py-3">{app.email || "-"}</td>
                      <td className="px-4 py-3">{app.phone || "-"}</td>
                      <td className="px-4 py-3">{app.description || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            app.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {app.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(app.id, app.userId)}
                              className="bg-[#5a19ad] text-white px-4 py-2 rounded-xl hover:bg-[#4a1591] transition text-sm font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerApplication;

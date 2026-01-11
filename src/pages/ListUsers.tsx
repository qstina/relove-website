import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

const AllUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  if (!user)
    return <p className="text-center mt-10">Please log in to view this page.</p>;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
<div className="container mx-auto px-4 lg:px-8 max-w-6xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <h2
          className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
        >
          👥 Registered Users
        </h2>

        {loading ? (
          <p className="text-gray-700 text-lg text-center">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-700 text-lg text-center py-12">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#5a19ad] text-white">
                <tr>
                  <th className="px-4 py-3 text-left rounded-tl-xl">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left rounded-tr-xl">Course</th>
                </tr>
              </thead>
              <tbody className="">
                {users.map((u, index) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-300 hover:bg-[#A087C7] transition ${
                      index === users.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-700">{u.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{u.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{u.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{u.role || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{u.course || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;

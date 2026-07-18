"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { firebaseApp } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { HashLoader } from "react-spinners";

type User = {
  id: string;
  username: string;
  email: string;
  profilepic?: string; 
};

export default function NetworkPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const defaultAvatar = "/default-avatar.png"; // Path to your placeholder avatar image

  useEffect(() => {
    const fetchUsers = async () => {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
       
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Network</h1>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Display Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className="p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/networkpost/${user.id}`)} // Navigate to user posts
            >
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                <Image
                    src={`${user?.profilepic||"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}`}
                    height={100} 
                    width={100}
                    loading="lazy"
                    alt={`${user?.username || "User"}'s avatar`}
                    className="rounded-full"
                  />

                </Avatar>
                <h2 className="text-lg font-semibold">
                  {user.username || "Anonymous"}
                </h2>
                <p className="text-sm text-gray-500">
                  {user.email || "No email available"}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No users match your search query
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapPin, Building2, GraduationCap, ThumbsDown, Camera } from "lucide-react";
import { FollowButton } from "@/components/ui/follow-button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import Head from "next/head";

interface PublicUserData {
  id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  profilepic?: string;
  failedExperience?: string[];
  misEducation?: string[];
  failureHighlights?: string[];
  followers?: string[];
  following?: string[];
  followerCount: number;
  followingCount: number;
}

export default function PublicProfile({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetching public user data
        const response = await fetch(`/api/users/${params.userId}`);
        if (response.ok) {
          const publicUserData = await response.json();
          setUserData(publicUserData);
          setFollowerCount(publicUserData.followerCount);

          // Check if current user is following this user
          if (currentUser) {
            const currentUserDoc = doc(db, "users", currentUser.uid);
            const currentUserSnap = await getDoc(currentUserDoc);
            
            if (currentUserSnap.exists()) {
              const currentUserData = currentUserSnap.data();
              const following = currentUserData.following || [];
              setIsFollowing(following.includes(params.userId));
            }
          }
        } else {
          toast.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.userId, currentUser]);

  const handleFollowChange = (newFollowingState: boolean) => {
    setIsFollowing(newFollowingState);
    setFollowerCount(prev => newFollowingState ? prev + 1 : prev - 1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader color="white" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const avatarSrc = userData.profilepic || 
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  const isOwnProfile = currentUser?.uid === params.userId;

  return (
    <div className="container mx-auto px-6 py-10">
      <Head>
        <title>{userData ? `${userData.username} — Fail U Forward` : "Profile — Fail U Forward"}</title>
        <meta
          name="description"
          content={userData ? `${userData.username}'s profile on Fail U Forward. ${userData.bio || "Discover their journey of learning from setbacks."}` : "View community profiles on Fail U Forward."}
        />
        <meta property="og:title" content={userData ? `${userData.username} — Fail U Forward` : "Profile — Fail U Forward"} />
        <meta property="og:description" content={userData ? (userData.bio || "Discover their journey of learning from setbacks.") : "View community profiles on Fail U Forward."} />
        <meta property="og:image" content={userData?.profilepic || "https://fail-u-forward.vercel.app/og-image.png"} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative bg-background text-foreground border border-gray-200/30 rounded-xl shadow-lg">
            <div className="h-24 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200"></div>
            <div className="p-8">
              <div className="flex items-start mb-6">
                <div className="relative">
                <Avatar className="w-36 h-36 mr-6 ring-3 ring-gray-600">
                    <AvatarImage 
                      src={avatarSrc} 
                      alt={`${userData?.username || "User"}'s avatar`} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <AvatarFallback className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-semibold text-gray-500">
                      {userData?.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Add profile change icon - only show on own profile */}
                  {isOwnProfile && (
                    <button 
                      className="absolute -bottom-2 right-2 bg-white border-2 border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => window.location.href = '/profile'}
                      title="Edit profile"
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 sm:items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{userData.username}</h1>
                      <p className="text-sm text-gray-500 mt-1">{userData.email}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <MapPin className="h-5 w-5" />
                        <span>{userData.location || "Unknown location"}</span>
                      </div>
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div className="text-center">
                          <span className="font-semibold text-foreground">{followerCount}</span>
                          <p className="text-gray-500">Followers</p>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-foreground">{userData.followingCount}</span>
                          <p className="text-gray-500">Following</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {!isOwnProfile && currentUser && (
                        <FollowButton
                          targetUserId={params.userId}
                          isFollowing={isFollowing}
                          onFollowChange={handleFollowChange}
                        />
                      )}
                      {isOwnProfile && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto px-5 py-2.5 border border-gray-200/50 rounded-lg text-sm font-medium text-foreground hover:bg-accent/50"
                          onClick={() => window.location.href = '/profile'}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 leading-relaxed">{userData.bio || "No bio available"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-background border border-gray-200/30 rounded-lg">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Failed Experience
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {userData.failedExperience?.map((experience, index) => (
                      <li key={index} className="text-sm text-gray-500">• {experience}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 bg-background border border-gray-200/30 rounded-lg">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Mis-Education
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {userData.misEducation?.map((education, index) => (
                      <li key={index} className="text-sm text-gray-500">• {education}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5" />
                  Failure Highlights
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {userData.failureHighlights?.map((highlight, index) => (
                    <span key={index} className="px-4 py-1.5 bg-gray-100/50 rounded-full text-sm text-gray-900">
                      {highlight}
                    </span>
                  ))}
                </div> 
              </div>
            </div>
          </Card> 
        </motion.div>
      </div>
    </div>
  );
}
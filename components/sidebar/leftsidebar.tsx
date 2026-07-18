"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Briefcase, BookOpen } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebaseApp, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface UserData {
  username: string;
  email: string;
  location?: string;
  bio?: string;
  profilepic?: string;
}

export function LeftSidebar() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          setUserData({
            username: "Anonymous",
            email: user.email || "user@example.com",
            bio: "Fail. Learn. Repeat.",
            profilepic: "/default-avatar.png",
            location: "Unknown",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({
          username: "UserA",
          email: user?.email || "user@example.com",
          bio: "Master of epic flops.",
          profilepic: "/default-avatar.png",
          location: "Unknown",
        });
      }
    };

    fetchUserData();
  }, [router]);

  const dummyUserData = {
    username: "UserB",
    email: "user@example.com",
    bio: "Learning from every mess.",
    profilepic: "/default-avatar.png",
  };

  const displayData = userData || dummyUserData;

  const toggleBio = () => setIsBioExpanded(!isBioExpanded);

  return (
    <div className="hidden w-[16%] absolute left-0 top-16 h-screen bg-background border-r border-border p-4 transition-colors md:block">
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border bg-card shadow-md text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4 ring-2 ring-border">
            <AvatarImage
              src={displayData.profilepic || "/default-avatar.png"}
              alt={`${displayData.username}'s avatar`}
              loading="lazy"
            />
            <AvatarFallback>{displayData.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg text-primary lowercase">
            {displayData.username}
          </h3>
          <p className="text-sm text-muted-foreground">
            {displayData.bio && displayData.bio.length > 80 ? (
              <>
                {isBioExpanded
                  ? displayData.bio
                  : displayData.bio.slice(0, 80) + "..."}
                <button
                  className="ml-1 text-primary text-sm focus:outline-none"
                  onClick={toggleBio}
                >
                  {isBioExpanded ? "See Less" : "See More"}
                </button>
              </>
            ) : (
              displayData.bio || "No bio available"
            )}
          </p>
          <Link
            href="/profile"
            className={buttonVariants({
              variant: "outline",
              className: "flex items-center w-full p-3 my-2 bg-background text-foreground border-border",
            })}
          >
            edit profile
          </Link>

        </div>

        <nav className="space-y-2">
          <Link
            href="/network"
            className={buttonVariants({
              variant: "ghost",
              className: "flex items-center w-full p-3",
            })}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>network</span>
          </Link>
          <Link
            href="/jobs"
            className={buttonVariants({
              variant: "ghost",
              className: "flex items-center w-full p-3",
            })}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            <span>failed jobs</span>
          </Link>
          <Link
            href="/learning"
            className={buttonVariants({
              variant: "ghost",
              className: "flex items-center w-full p-3",
            })}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            <span>learning</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

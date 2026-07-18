import admin from "@/lib/firebaseAdmin";

const db = admin.firestore();

export async function getUserById(userId: string) {
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return null;

    const userData = userSnap.data();

    return {
        id: userId,
        username: userData?.username,
        displayName: userData?.displayName || "",
        bio: userData?.bio || "",
        location: userData?.location || "",
        profilepic: userData?.profilepic || "",
        failedExperience: userData?.failedExperience || [],
        misEducation: userData?.misEducation || [],
        failureHighlights: userData?.failureHighlights || [],
        followers: userData?.followers || [],
        following: userData?.following || [],
        followerCount: userData?.followers?.length || 0,
        followingCount: userData?.following?.length || 0,
    };
}

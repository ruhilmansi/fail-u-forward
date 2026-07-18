import admin from "@/lib/firebaseAdmin";

const db = admin.firestore();

export async function fetchPosts() {
    const postsSnapshot = await db
        .collection("posts")
        .orderBy("timestamp", "desc")
        .get();
    return postsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate
                ? data.timestamp.toDate()
                : new Date(data.timestamp),
        };
    });
}

export async function createPost(
    uid: string,
    content: string,
    imageUrl?: string,
    userName?: string
) {
    const postData = {
        content,
        imageUrl: imageUrl || null,
        timestamp: new Date(),
        userId: uid,
        userName: userName || "Anonymous",
        editableUntil: Date.now() + 10 * 60 * 1000,
        likes: 0,
        likedBy: [],
        dislikes: 0,
        dislikedBy: [],
        shares: 0,
        comments: [],
        reactions: {
            hit_hard: { count: 0, users: [] },
            sending_love: { count: 0, users: [] },
            deep_insight: { count: 0, users: [] },
            thank_you: { count: 0, users: [] },
            been_there: { count: 0, users: [] },
        },
    };

    await db.collection("posts").add(postData);
    return postData;
}

export async function getPostById(postId: string) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) return null;
    return postDoc.data();
}

export async function addCommentToPost(
    postId: string,
    comment: { userId: string; text: string }
) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return null;

    const post = postDoc.data();
    const comments = post?.comments || [];
    const newComments = [...comments, { ...comment, timestamp: Date.now() }];

    await postRef.update({ comments: newComments });
    return newComments;
}

export async function toggleDislike(postId: string, userId: string) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return null;

    const post = postDoc.data();
    const likedBy: string[] = post?.likedBy || [];
    const dislikedBy: string[] = post?.dislikedBy || [];
    const reactions = post?.reactions || {};

    const hasLiked = likedBy.includes(userId);
    const hasDisliked = dislikedBy.includes(userId);

    // Remove user from all emoji reactions
    const updatedReactions = { ...reactions };
    for (const [key, reaction] of Object.entries(updatedReactions)) {
        const r = reaction as { count: number; users: string[] };
        if (r.users.includes(userId)) {
            updatedReactions[key] = {
                count: Math.max(r.count - 1, 0),
                users: r.users.filter((uid) => uid !== userId),
            };
        }
    }

    let newLikedBy = likedBy;
    let newDislikedBy: string[];
    let newLikes = post?.likes || 0;
    let newDislikes: number;

    if (hasDisliked) {
        newDislikedBy = dislikedBy.filter((id) => id !== userId);
        newDislikes = Math.max((post?.dislikes || 0) - 1, 0);
    } else {
        newDislikedBy = [...dislikedBy, userId];
        newDislikes = (post?.dislikes || 0) + 1;
        if (hasLiked) {
            newLikedBy = likedBy.filter((id) => id !== userId);
            newLikes = Math.max((post?.likes || 0) - 1, 0);
        }
    }

    await postRef.update({
        likes: newLikes,
        likedBy: newLikedBy,
        dislikes: newDislikes,
        dislikedBy: newDislikedBy,
        reactions: updatedReactions,
    });

    return {
        id: postId,
        likes: newLikes,
        likedBy: newLikedBy,
        dislikes: newDislikes,
        dislikedBy: newDislikedBy,
        reactions: updatedReactions,
    };
}

export async function editPostContent(
    postId: string,
    userId: string,
    content: string
) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return { error: "Post not found", status: 404 };

    const post = postDoc.data();

    if (post?.userId !== userId)
        return { error: "Not authorized to edit this post", status: 403 };
    if (Date.now() > post?.editableUntil)
        return { error: "Edit time has expired", status: 403 };

    await postRef.update({ content });
    return { success: true, content };
}

export async function toggleLike(postId: string, userId: string) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return null;

    const post = postDoc.data();
    const likedBy: string[] = post?.likedBy || [];
    const dislikedBy: string[] = post?.dislikedBy || [];

    const hasLiked = likedBy.includes(userId);
    const hasDisliked = dislikedBy.includes(userId);

    let newLikedBy = likedBy;
    let newDislikedBy = dislikedBy;
    let newLikes = post?.likes || 0;
    let newDislikes = post?.dislikes || 0;

    if (hasLiked) {
        newLikedBy = likedBy.filter((id) => id !== userId);
        newLikes = Math.max(newLikes - 1, 0);
    } else {
        newLikedBy = [...likedBy, userId];
        newLikes += 1;
        if (hasDisliked) {
            newDislikedBy = dislikedBy.filter((id) => id !== userId);
            newDislikes = Math.max(newDislikes - 1, 0);
        }
    }

    await postRef.update({
        likes: newLikes,
        likedBy: newLikedBy,
        dislikes: newDislikes,
        dislikedBy: newDislikedBy,
    });

    return {
        id: postId,
        likes: newLikes,
        likedBy: newLikedBy,
        dislikes: newDislikes,
        dislikedBy: newDislikedBy,
    };
}

export type ReactionData = { count: number; users: string[] };
export type Reactions = { [key: string]: ReactionData };

const VALID_REACTIONS = [
    "hit_hard",
    "sending_love",
    "deep_insight",
    "thank_you",
    "been_there",
];

export async function toggleReaction(
    postId: string,
    userId: string,
    reactionType: string
) {
    if (!VALID_REACTIONS.includes(reactionType)) {
        return { error: "Invalid reaction type", status: 400 };
    }

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) return { error: "Post not found", status: 404 };

    const post = postDoc.data();
    const reactions: Reactions = post?.reactions || {};
    const dislikedBy: string[] = post?.dislikedBy || [];

    const updatedReactions: Reactions = { ...reactions };

    if (!updatedReactions[reactionType]) {
        updatedReactions[reactionType] = { count: 0, users: [] };
    }

    const currentReaction = updatedReactions[reactionType];
    const hasReacted = currentReaction.users.includes(userId);

    // Remove user from all other reactions
    for (const [key, reaction] of Object.entries(updatedReactions)) {
        const r = reaction as ReactionData;
        if (key !== reactionType && r.users.includes(userId)) {
            updatedReactions[key] = {
                count: Math.max(r.count - 1, 0),
                users: r.users.filter((uid) => uid !== userId),
            };
        }
    }

    // Toggle the selected reaction
    updatedReactions[reactionType] = hasReacted
        ? {
              count: Math.max(currentReaction.count - 1, 0),
              users: currentReaction.users.filter((uid) => uid !== userId),
          }
        : {
              count: currentReaction.count + 1,
              users: [...currentReaction.users, userId],
          };

    // Remove user from dislikedBy if present
    const updatedDislikedBy = dislikedBy.includes(userId)
        ? dislikedBy.filter((id) => id !== userId)
        : dislikedBy;

    await postRef.update({
        reactions: updatedReactions,
        dislikedBy: updatedDislikedBy,
        dislikes: updatedDislikedBy.length,
    });

    const updatedPost = (await postRef.get()).data();
    return { post: updatedPost };
}

export async function incrementShare(postId: string) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return { error: "Post not found", status: 404 };

    const post = postDoc.data();
    const newShares = (post?.shares || 0) + 1;

    await postRef.update({ shares: newShares });

    return { id: postId, shares: newShares };
}

export async function deletePost(postId: string, userId: string) {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) return { error: "Post not found", status: 404 };

    const post = postDoc.data();
    if (post?.userId !== userId)
        return { error: "Not authorized to delete this post", status: 403 };

    await postRef.delete();
    return { success: true };
}

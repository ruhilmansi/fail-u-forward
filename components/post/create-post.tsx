import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link2, ThumbsDown, MessageCircle, ImageUp, Trash2 } from "lucide-react";
import { LikeReactionPopover } from "./LikeReactionPopover";
import { onAuthStateChanged } from "firebase/auth";
type User = {
  id: string;
  username: string;
  email: string;
  profilepic?: string;
};

function timeAgo(date: any) {
  const now = Date.now();
  const then = typeof date === "object" && date?.toDate ? date.toDate().getTime() : new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

export function CreatePost() {
  const [postContent, setPostContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [dislikedPosts, setDislikedPosts] = useState<string[]>([]);
  const dislikes = useRef(0);
  const [commentBoxStates, setCommentBoxStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentUserProfilePic, setCurrentUserProfilePic] = useState<
    string | null
  >(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [authInitialized, setAuthInitialized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [postReactions, setPostReactions] = useState<{ [key: string]: any }>({});
  // NEW: small state for click-toggle animation of POST button
  const [postBtnActive, setPostBtnActive] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/post');
      const data = await response.json();

      if (response.ok) {
        const postsList = data.posts.map((post: any) => ({
          id: post.id,
          likes: post.likes || 0,
          likedBy: post.likedBy || [],
          dislikes: post.dislikes || 0,
          dislikedBy: post.dislikedBy || [],
          comments: post.comments || [],
          ...post,
        }));

        setPosts(postsList);

        // Update local liked and disliked posts state for the current user (if logged in)
        const currentUser = auth.currentUser;
        if (currentUser) {
          const likedPostIds = postsList
            .filter((post: any) => post.likedBy.includes(currentUser.uid))
            .map((post: any) => post.id);
          setLikedPosts(likedPostIds);

          const dislikedPostIds = postsList
            .filter((post: any) => post.dislikedBy.includes(currentUser.uid))
            .map((post: any) => post.id);
          setDislikedPosts(dislikedPostIds);
        }

        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrorMessage("Failed to fetch posts");
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size should be less than 10MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImageToFirebase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      // Get auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("Please login to upload images");
        return null;
      }

      const idToken = await currentUser.getIdToken();

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ image: base64 })
      });

      const data = await response.json();

      if (response.ok) {
        return data.url;
      } else {
        toast.error(data.error || "Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap: Record<string, User> = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = { id: doc.id, ...doc.data() } as User;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const fetchCurrentUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    try {
      const userDoc = await getDocs(collection(db, "users"));
      const userData = userDoc.docs
        .find((doc) => doc.id === currentUser.uid)
        ?.data();

      if (userData && userData.profilepic) {
        setCurrentUserProfilePic(userData.profilepic);
      } else {
        setCurrentUserProfilePic(
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setCurrentUserProfilePic(
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
      );
    }
  }, [router]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {

        await fetchPosts();
        await fetchUsers();
      } catch (error) {
        console.error("Error loading initial data:", error);
        if (error instanceof Error && error.message.includes('insufficient permissions')) {
        } else {
          setErrorMessage("Failed to load posts. Please refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthInitialized(true);
      if (user) {
        // User is signed in - fetch user profile
        try {
          await fetchCurrentUserProfile();// Refresh posts to update like/dislike states for this user
          await fetchPosts();
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setCurrentUserProfilePic(null);
        setLikedPosts([]);
        setDislikedPosts([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchCurrentUserProfile]);
  const handlePostComment = async (postId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    const commentText = commentInputs[postId];
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    const post = posts[postIndex];
    const newComment = {
      userId: currentUser.uid,
      text: commentText,
      timestamp: Date.now()
    };
    const newComments = [...(post.comments || []), newComment];

    setPosts((prevPosts) =>
      prevPosts.map((p, idx) =>
        idx === postIndex ? { ...p, comments: newComments } : p
      )
    );
    setCommentInputs((prev: any) => ({ ...prev, [postId]: "" }));

    try {
      const idToken = await currentUser.getIdToken();
      await fetch(`/api/post/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ text: commentText })
      });
      toast.success("Comment posted successfully.");
    } catch (error) {
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex ? { ...p, comments: post.comments } : p
        )
      );
      setCommentInputs((prev: any) => ({ ...prev, [postId]: commentText }));
      toast.error("Failed to post comment.");
    }
  };

  const handlePostSubmit = async () => {
    setLoading(true);
    if (postContent.trim()) {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        let imageUrl = null;
        if (selectedImage) {
          imageUrl = await uploadImageToFirebase(selectedImage);
        }

        const idToken = await currentUser.getIdToken();
        const response = await fetch("/api/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ content: postContent, imageUrl })
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          await fetchPosts();
          toast.success("Your voice shall be heard");
          setPostContent("");
          setSelectedImage(null);
          setImagePreview(null);
        } else {
          toast.error(data.error || "Content not appropriate for posting");
        }
      } catch (error) {
        console.error("Error processing post:", error);
        toast.error("An error occurred while posting.");
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage("Post content is empty.");
      setLoading(false);
    }
  };


  const handleDislike = async (postId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You need to be logged in to dislike a post.");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex === -1) return;
    const post = posts[postIndex];
    const userId = currentUser.uid;
    const hasDisliked = post.dislikedBy?.includes(userId);
    const hasLiked = post.likedBy?.includes(userId);

    // UI update
    let newLikedBy = post.likedBy;
    let newDislikedBy = post.dislikedBy || [];
    let newLikes = post.likes;
    let newDislikes = post.dislikes || 0;

    if (hasDisliked) {
      newDislikedBy = newDislikedBy.filter((id: string) => id !== userId);
      newDislikes = Math.max(newDislikes - 1, 0);
    } else {
      newDislikedBy = [...newDislikedBy, userId];
      newDislikes = newDislikes + 1;
      if (hasLiked) {
        newLikedBy = newLikedBy.filter((id: string) => id !== userId);
        newLikes = Math.max(newLikes - 1, 0);
        setLikedPosts(likedPosts.filter((id) => id !== postId));
      }
    }

    setPosts((prevPosts) =>
      prevPosts.map((p, idx) =>
        idx === postIndex
          ? { ...p, likes: newLikes, likedBy: newLikedBy, dislikes: newDislikes, dislikedBy: newDislikedBy }
          : p
      )
    );
    setDislikedPosts(hasDisliked ? dislikedPosts.filter((id) => id !== postId) : [...dislikedPosts, postId]);
    console.log("DislikedPosts state after update:", newDislikes);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/post/${postId}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to update dislike");

      // Parse updated post from backend
      const updatedPost = await response.json();

      // Update posts state with latest backend data for exact sync
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex
            ? {
              ...p,
              likes: updatedPost.likes,
              likedBy: updatedPost.likedBy,
              dislikes: updatedPost.dislikes,
              dislikedBy: updatedPost.dislikedBy,
              reactions: updatedPost.reactions || p.reactions, // in case backend updated reactions on dislike
            }
            : p
        )
      );

      // Also update dislikedPosts state based on backend signal
      if ((updatedPost.dislikedBy || []).includes(userId)) {
        setDislikedPosts((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
      } else {
        setDislikedPosts((prev) => prev.filter((id) => id !== postId));
      }
    } catch (error) {
      // Rollback UI update on failure
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex ? post : p
        )
      );
      setDislikedPosts(hasDisliked ? [...dislikedPosts, postId] : dislikedPosts.filter((id) => id !== postId));
      toast.error("Failed to update dislikes.");
    }
  };


  const handleShare = async (postId: string) => {
    const postIndex = posts.findIndex((post) => post.id === postId);
    const post = posts[postIndex];
    const newShares = (post.shares || 0) + 1;

    setPosts((prevPosts) =>
      prevPosts.map((p, idx) =>
        idx === postIndex ? { ...p, shares: newShares } : p
      )
    );

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        await fetch(`/api/post/${postId}/share`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
      }

      const shareUrl = `${window.location.origin}/post/${postId}`;
      if (navigator.share) {
        await navigator.share({
          title: "Check out this post!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Post link copied to clipboard!");
      }
    } catch (error) {
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex ? { ...p, shares: post.shares } : p
        )
      );
      toast.error("Failed to share post.");
    }
  };

  //Updated likes to reaction function
  const handleReaction = async (postId: string, reactionType: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You need to be logged in to react to a post.");
      return;
    }

    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const currentReactions = post.reactions || {};

    // UI update
    const updatedReactions = { ...currentReactions };
    const userId = currentUser.uid;

    // Remove user from all reactions first
    Object.keys(updatedReactions).forEach((key) => {
      updatedReactions[key] = {
        count: Math.max((updatedReactions[key]?.count || 0) - (updatedReactions[key]?.users.includes(userId) ? 1 : 0), 0),
        users: (updatedReactions[key]?.users || []).filter((id: string) => id !== userId),
      };
    });

    // Toggle the selected reaction
    const hasReacted = currentReactions[reactionType]?.users?.includes(userId);
    if (!hasReacted) {
      if (!updatedReactions[reactionType]) {
        updatedReactions[reactionType] = { count: 0, users: [] };
      }
      updatedReactions[reactionType] = {
        count: (updatedReactions[reactionType]?.count || 0) + 1,
        users: [...(updatedReactions[reactionType]?.users || []), userId],
      };
    }

    setPosts((prevPosts) =>
      prevPosts.map((p, idx) =>
        idx === postIndex ? { ...p, reactions: updatedReactions } : p
      )
    );

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/post/${postId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ reactionType }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }

      const data = await response.json();

      // Update with server response
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex
            ? {
              ...p,
              reactions: data.reactions,
              dislikedBy: data.dislikedBy || [],
              dislikes: data.dislikes || 0
            }
            : p
        )
      );
      // Update dislikedPosts
      const currentUserId = currentUser.uid;
      if (currentUserId) {
        if ((data.dislikedBy || []).includes(currentUserId)) {
          setDislikedPosts((prev) =>
            prev.includes(postId) ? prev : [...prev, postId]
          );
        } else {
          setDislikedPosts((prev) => prev.filter(id => id !== postId));
        }
      }
    } catch (error) {
      // Revert update on error
      setPosts((prevPosts) =>
        prevPosts.map((p, idx) =>
          idx === postIndex ? { ...p, reactions: currentReactions } : p
        )
      );
      toast.error("Failed to update reaction.");
    }
  };

  const handlePostClick = async (postId: string) => {
    window.location.href = `${window.location.origin}/post/${postId}`;
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }

  const handleEditPost = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditContent(content);
  };

  const handleSaveEdit = async (postId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/post/${postId}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, content: editContent } : post
        ));
        setEditingPostId(null);
        setEditContent("");
        toast.success("Post updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update post");
      }
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleDeletePost = async (postId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!window.confirm("Delete this post?")) return;

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/post/${postId}/delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        toast.success("Post deleted");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const canEditPost = (post: any) => {
    const currentUser = auth.currentUser;
    return currentUser &&
      post.userId === currentUser.uid &&
      Date.now() < post.editableUntil;
  };

  const toggleCommentBox = (postId: string) => {
    setCommentBoxStates((prev: any) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 top-0 h-[20%] flex items-center justify-center z-50">
          <HashLoader size={50} color="#ffffff" />
        </div>
      )}

      {/* Show post creation only if user is authenticated */}
      {authInitialized && auth.currentUser && (
        <>

<div className="bg-card border border-border rounded-xl mx-auto w-full max-w-[560px]">
  <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-border">
    <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border">
      <Image
        loading="lazy"
        src={currentUserProfilePic || ""}
        width={100}
        height={100}
        alt="Your avatar"
        className="rounded-full object-cover"
      />
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate lowercase">{(auth.currentUser?.displayName || "share your story")}</p>
      <p className="text-xs text-muted-foreground">create a post</p>
    </div>
  </div>

  <div className="px-5 py-4">
    <textarea
      id="post-content"
      placeholder="project idea..."
      className="w-full bg-transparent text-foreground border-0 text-sm placeholder:text-muted-foreground resize-none focus:outline-none min-h-[100px]"
      value={postContent}
      onChange={(e: any) => setPostContent(e.target.value)}
      maxLength={2000}
    />

    {imagePreview && (
      <div className="mt-3 relative rounded-xl overflow-hidden border border-border">
        <Image
          src={imagePreview}
          alt="Preview"
          width={500}
          height={300}
          className="object-cover w-full max-h-80"
        />
        <button
          onClick={removeImage}
          className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-background/80 text-foreground text-sm hover:bg-background transition"
        >
          ✕
        </button>
      </div>
    )}

    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
      <label htmlFor="image-upload" className="cursor-pointer">
        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted">
          <ImageUp className="h-4 w-4" />
          <span>image</span>
        </div>
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      {uploadingImage && (
        <span className="text-xs text-muted-foreground">Uploading...</span>
      )}

      <button
        onClick={async () => {
          setPostBtnActive(true);
          setTimeout(() => setPostBtnActive(false), 300);
          await handlePostSubmit();
        }}
        disabled={loading || uploadingImage || !postContent.trim()}
        className="px-5 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition"
      >
        {loading || uploadingImage ? "posting..." : "post"}
      </button>
    </div>

    {errorMessage && (
      <p className="text-destructive text-xs mt-2">{errorMessage}</p>
    )}
  </div>
</div>
        </>
      )}

      {authInitialized && !auth.currentUser && (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            <button onClick={() => router.push("/login")} className="text-primary font-medium hover:underline">
              Login
            </button>
            {" "}to create posts, like, and comment
          </p>
        </div>
      )}

      {authInitialized && auth.currentUser && errorMessage && !posts.length && (
        <div className="bg-card border border-border rounded-xl p-8 text-center mt-6">
          <div className="text-muted-foreground text-lg font-medium mb-2">⚠️ Failed to Load Posts</div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            {errorMessage}
          </p>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="px-5 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-40"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Show posts only if user is authenticated */}
      {authInitialized && auth.currentUser && (
        <div className="mt-6">
          {posts.length > 0 ? (
            posts.map((post: any) => {
              const user = users[post.userId];
              const profilePic =
                user?.profilepic ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
              return (
                <div
                  key={post.id}
                  className="bg-card border border-border rounded-xl mb-4 overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                  onKeyDown={(e) => handleKeyDown(e, () => handlePostClick(post.id))}
                  tabIndex={0}
                  role="button"
                  aria-label={`View post by ${post.userName}`}
                >
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 px-5 pt-5 pb-2">
                    <Avatar className="w-12 h-12 ring-2 ring-border">
                      <Image
                        src={profilePic}
                        height={100}
                        width={100}
                        alt={`${user?.username || "Anonymous"}'s avatar`}
                        className="rounded-full object-cover"
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/profile/${post.userId}`);
                        }}
                        className="font-semibold text-sm text-foreground truncate hover:underline text-left"
                      >
                        {post.userName}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(post.timestamp)}
                      </p>
                    </div>
                    {canEditPost(post) && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEditPost(post.id, post.content);
                          }}
                          className="text-muted-foreground hover:text-foreground text-xs"
                        >
                          Edit
                        </Button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeletePost(post.id);
                          }}
                          className="text-muted-foreground hover:text-destructive transition p-1.5 rounded hover:bg-destructive/10"
                          aria-label="Delete post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="px-5 py-3">
                    {editingPostId === post.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                          onClick={(event) => event.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSaveEdit(post.id);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCancelEdit();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground leading-relaxed text-[15px]">{post.content}</p>
                    )}

                    {/* Display image if exists */}
                    {post.imageUrl && (
                      <div className="mt-3 -mx-5">
                        <Image
                          src={post.imageUrl}
                          alt="Post image"
                          width={500}
                          height={300}
                          className="object-cover w-full max-h-96 lg:max-h-[500px]"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-around text-sm text-muted-foreground mt-3 pt-1">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <LikeReactionPopover
                          reactions={post.reactions || {}}
                          currentUserId={auth.currentUser?.uid || null}
                          onReact={(reactionType) => handleReaction(post.id, reactionType)}
                        />
                      </motion.div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!auth.currentUser) {
                            toast.error("Please login to dislike posts");
                            return;
                          }
                          handleDislike(post.id);
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        aria-label={`${dislikedPosts.includes(post.id) ? 'Remove dislike from' : 'Dislike'} post by ${post.userName}`}
                        aria-pressed={dislikedPosts.includes(post.id)}
                      >
                        <ThumbsDown
                          className={`h-4 w-4 ${dislikedPosts.includes(post.id) ? "text-blue-500" : likedPosts.includes(post.id) ? "text-red-500" : ""}`}
                          aria-hidden="true"
                        />
                        <span>{post.dislikes || 0}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!auth.currentUser) {
                            toast.error("Please login to comment on posts");
                            return;
                          }
                          toggleCommentBox(post.id)
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        aria-label={`${commentBoxStates[post.id] ? 'Hide' : 'Show'} comments for post by ${post.userName}`}
                        aria-expanded={commentBoxStates[post.id] || false}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        <span>{post.comments?.length || 0}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleShare(post.id)
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        aria-label={`Share post by ${post.userName}`}
                      >
                        <Link2 className="h-4 w-4" aria-hidden="true" />
                        <span>{post.shares || 0}</span>
                      </Button>
                    </div>
                  </div>
                  {commentBoxStates[post.id] && auth.currentUser && (
                    <div className="px-5 pb-4">
                      <div className="flex items-start gap-3 pt-3 border-t border-border">
                        <Avatar className="w-9 h-9 shrink-0">
                          <Image
                            src={currentUserProfilePic || ""}
                            height={100}
                            width={100}
                            alt="User Avatar"
                            className="rounded-full"
                          />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Textarea
                            placeholder="Write a comment..."
                            className="min-h-[40px] resize-none text-sm rounded-xl bg-muted/50 border-border focus:bg-muted"
                            value={commentInputs[post.id] || ""}
                            onChange={(e: any) =>
                              setCommentInputs((prev: any) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onClick={(event) => event.stopPropagation()}
                            maxLength={500}
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePostComment(post.id)
                              }}
                              disabled={!commentInputs[post.id]?.trim()}
                              className="h-8 px-4 text-xs font-medium"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {post.comments.map((comment: any, index: any) => (
                            <div
                              key={index}
                              className="flex items-start gap-3"
                            >
                              <Avatar className="w-8 h-8 shrink-0 ring-1 ring-border">
                                <Image
                                  src={
                                    users[comment.userId]?.profilepic ||
                                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                  }
                                  width={100}
                                  height={100}
                                  alt="Commenter's Avatar"
                                  className="rounded-full"
                                />
                              </Avatar>
                              <div className="flex-1 min-w-0 bg-muted/30 rounded-xl px-3 py-2">
                                <p className="font-semibold text-xs text-foreground">
                                  {users[comment.userId]?.username || "Anonymous"}
                                </p>
                                <p className="text-sm text-foreground/90">{comment.text}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {timeAgo(comment.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show comments even if user is not logged in */}
                  {post.comments && post.comments.length > 0 && !auth.currentUser && (
                    <div className="px-5 pb-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">Comments</p>
                      {post.comments.map((comment: any, index: any) => (
                        <div
                          key={index}
                          className="flex items-start gap-3"
                        >
                          <Avatar className="w-8 h-8 shrink-0 ring-1 ring-border">
                            <Image
                              src={
                                users[comment.userId]?.profilepic ||
                                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                              }
                              width={100}
                              height={100}
                              alt="Commenter's Avatar"
                              className="rounded-full"
                            />
                          </Avatar>
                          <div className="flex-1 min-w-0 bg-muted/30 rounded-xl px-3 py-2">
                            <p className="font-semibold text-xs text-foreground">
                              {users[comment.userId]?.username || "Anonymous"}
                            </p>
                            <p className="text-sm text-foreground/90">{comment.text}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {timeAgo(comment.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              {errorMessage ? (
                <div className="space-y-4">
                  <div className="text-red-500 text-lg font-medium">
                    ⚠️ Failed to Load Posts
                  </div>
                  <p className="text-muted-foreground max-w-md">
                    We couldn't fetch the posts right now. This might be due to network issues or database permissions.
                  </p>
                  <Button
                    variant="outline"
                    onClick={fetchPosts}
                    disabled={loading}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <HashLoader size={35} color="#888" />
                  <p className="text-muted-foreground text-sm mt-4">Loading posts...</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">no posts yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    be the first to share your story
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {authInitialized && !auth.currentUser && (
        <div className="bg-card border border-border rounded-xl p-8 text-center mt-6">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Posts are Private</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
            Please login to view and interact with posts from the community.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-5 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Login to View Posts
          </button>
        </div>
      )}
    </div>
  );
}
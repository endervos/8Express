import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, MessageSquare, Share } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../Images/Logo.png";

const API_BASE = "http://localhost:5000";

const PostDetail = ({ isLoggedIn, userInfo }) => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 403) {
          const j = await res.json();
          setForbidden(j.message);
          setPost(null);
        } else if (!res.ok) {
          throw new Error("Không thể tải bài viết");
        } else {
          const j = await res.json();
          setPost(j.data);
          setForbidden(null);
        }
      } catch (err) {
        console.error(err);
        setForbidden("Lỗi tải bài viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
      const j = await res.json();
      if (j.success) setComments(j.data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Đang tải bài viết...</p>
      </div>
    );

  if (forbidden)
    return (
      <div className="min-h-screen bg-gray-50 text-center py-20">
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Bài viết không khả dụng
        </h2>
        <p className="text-gray-600">{forbidden}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Không tìm thấy bài viết.</p>
      </div>
    );

  const isOwner = userInfo?.id === post.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <img
            src={logo}
            alt="Logo"
            className="h-14 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Category */}
          <div className="px-8 pt-6">
            <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <div className="px-8 py-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {post.title}
            </h1>

            {isOwner && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${post.status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : post.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : post.status === "Hidden"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                Trạng thái: {post.status}
              </span>
            )}
          </div>

          {/* Author */}
          <div className="px-8 pb-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar || logo}
                alt={post.author}
                onClick={() => navigate(`/user/${post.user_id}`)}
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
              <div>
                <p
                  onClick={() => navigate(`/user/${post.user_id}`)}
                  className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition"
                >
                  {post.author}
                </p>
                <div className="text-sm text-gray-500 flex gap-2 items-center">
                  <span>
                    {new Date(post.publishedAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            {userInfo?.id !== post.user_id && (
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg font-medium transition ${isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>

          {/* Media */}
          {(post.image || post.video || post.audio) && (
            <div className="px-8 pt-6">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full max-h-[480px] object-cover rounded-lg mb-6"
                />
              )}
              {post.video && (
                <video
                  src={post.video}
                  controls
                  className="w-full rounded-lg mb-6"
                />
              )}
              {post.audio && (
                <audio
                  src={post.audio}
                  controls
                  className="w-full rounded-lg mb-6"
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          <div className="px-8 py-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex flex-wrap items-center gap-4 text-gray-700">
              {post.reactions && post.reactions.length > 0 ? (
                post.reactions.map((r, i) => {
                  const isSelected =
                    post.userReaction &&
                    post.userReaction.toLowerCase() === r.name.toLowerCase();
                  return (
                    <button
                      key={i}
                      onClick={async () => {
                        if (!isLoggedIn) {
                          alert("Bạn cần đăng nhập để thả cảm xúc!");
                          return;
                        }
                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(
                            `${API_BASE}/posts/${postId}/react`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                reactionName: r.name.toLowerCase(),
                              }),
                            }
                          );
                          const j = await res.json();
                          if (j.success) {
                            const updated = await fetch(
                              `${API_BASE}/posts/${postId}`,
                              {
                                headers: token
                                  ? { Authorization: `Bearer ${token}` }
                                  : {},
                              }
                            );
                            const newData = await updated.json();
                            setPost(newData.data);
                          } else alert(j.message);
                        } catch (err) {
                          console.error("Lỗi khi thả cảm xúc:", err);
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md transition text-lg ${isSelected
                        ? "bg-indigo-100 text-indigo-600 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                      title={r.name}
                    >
                      <span>{r.icon}</span>
                      <span
                        className={`text-sm ${r.count === 0
                          ? "text-gray-400"
                          : "text-gray-600 font-medium"
                          }`}
                      >
                        {r.count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">
                  Chưa có cảm xúc nào
                </span>
              )}

              <div className="flex items-center gap-4 text-gray-600 ml-4">
                <div className="flex items-center gap-1">
                  <MessageSquare size={18} />
                  <span>{comments.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share size={18} />
                  <span>{post.shareCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="p-2 hover:bg-gray-200 rounded-full"
                title="Chia sẻ bài viết"
                onClick={async () => {
                  if (!isLoggedIn) {
                    alert("Bạn cần đăng nhập để chia sẻ bài viết!");
                    return;
                  }
                  try {
                    const res = await fetch(`${API_BASE}/share`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        post_id: postId,
                        user_id: userInfo.id,
                      }),
                    });
                    const j = await res.json();
                    if (j.success) {
                      alert("Bài viết đã được chia sẻ lên trang cá nhân!");
                    } else {
                      alert(`${j.message}`);
                    }
                  } catch (err) {
                    console.error("Lỗi chia sẻ bài viết:", err);
                    alert("Đã xảy ra lỗi khi chia sẻ bài viết!");
                  }
                }}
              >
                <Share size={18} />
              </button>
            </div>
          </div>

          <section className="px-8 py-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-6">
              Bình luận ({comments.length})
            </h3>

            {isLoggedIn && (
              <div className="flex gap-3 mb-8">
                <img
                  src={
                    userInfo?.avatar
                      ? `data:image/jpeg;base64,${userInfo.avatar}`
                      : logo
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      disabled={!commentText.trim()}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/comments`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              post_id: postId,
                              user_id: userInfo.id,
                              body: commentText,
                            }),
                          });
                          const j = await res.json();
                          if (j.success) {
                            setCommentText("");
                            await fetchComments();
                          }
                        } catch (err) {
                          console.error("Add comment error:", err);
                        }
                      }}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  userInfo={userInfo}
                  isLoggedIn={isLoggedIn}
                  postId={postId}
                  refreshComments={fetchComments}
                />
              ))}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
};

export default PostDetail;

const CommentItem = ({
  comment,
  level = 0,
  userInfo,
  isLoggedIn,
  postId,
  refreshComments,
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();

  return (
    <div style={{ marginLeft: level * 32 }} className="flex gap-3 mb-4">
      <img
        src={comment.userAvatar || logo}
        alt={comment.userName}
        onClick={() => navigate(`/user/${comment.user_id}`)}
        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
      />
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span
              onClick={() => navigate(`/user/${comment.user_id}`)}
              className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition"
            >
              {comment.userName}
            </span>
            <span className="text-xs text-gray-500">{comment.created_at}</span>
          </div>
          <p className="text-gray-700">{comment.content}</p>

          {isLoggedIn && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              {replyOpen ? "Hủy" : "Trả lời"}
            </button>
          )}

          {replyOpen && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập nội dung trả lời..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  disabled={!replyText.trim()}
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/comments`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          post_id: postId,
                          user_id: userInfo.id,
                          body: replyText,
                          parent_id: comment.id,
                        }),
                      });
                      const j = await res.json();
                      if (j.success) {
                        setReplyText("");
                        setReplyOpen(false);
                        await refreshComments();
                      }
                    } catch (err) {
                      console.error("Reply comment error:", err);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hiển thị reply con */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                level={level + 1}
                userInfo={userInfo}
                isLoggedIn={isLoggedIn}
                postId={postId}
                refreshComments={refreshComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
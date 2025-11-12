import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, MessageSquare, Share, MoreVertical } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

const API_BASE = "http://localhost:5000";

const PostDetail = ({ isLoggedIn, userInfo }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSharedUsers, setShowSharedUsers] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [originalMedia, setOriginalMedia] = useState({
    image: null,
    video: null,
    audio: null,
  });
  const [editData, setEditData] = useState({
    title: "",
    body: "",
    image: null,
    video: null,
    audio: null,
  });
  const [deleteFlags, setDeleteFlags] = useState({
    image: false,
    video: false,
    audio: false,
  });

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-wrapper")) setShowMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const countAllComments = (comments) => {
    if (!comments || comments.length === 0) return 0;
    return comments.reduce(
      (acc, c) => acc + 1 + countAllComments(c.replies || []),
      0
    );
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (typeof file === "string") return resolve(file);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const fetchSharedUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/shared-list`);
      const j = await res.json();
      if (j.success) setSharedUsers(j.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách người chia sẻ:", err);
    }
  };

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

  const isOwner =
    (userInfo?.role === "user" && userInfo?.id === post.user_id) ||
    (userInfo?.role === "admin" && userInfo?.id === post.admin_id);

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
          {/* Topic */}
          <div className="px-8 pt-6 flex justify-between items-start relative">
            <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {post.topic}
            </span>
            {isOwner && (
              <div className="relative menu-wrapper">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
                  title="Tùy chọn"
                >
                  <MoreVertical size={20} />
                </button>
                {showMenu && (
                  <div className="absolute z-20 right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setOriginalMedia({
                          image: post.image,
                          video: post.video,
                          audio: post.audio,
                        });
                        setEditData({
                          title: post.title,
                          body: post.body,
                          image: post.image,
                          video: post.video,
                          audio: post.audio,
                        });
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          if (!token) return alert("Bạn cần đăng nhập!");
                          if (post.status !== "Approved" && post.status !== "Hidden") {
                            return alert("Chỉ bài viết đã được duyệt mới có thể ẩn hoặc hiển thị lại.");
                          }
                          const newStatus = post.status === "Hidden" ? "Approved" : "Hidden";
                          const imageBase64 = await toBase64(editData.image);
                          const videoBase64 = await toBase64(editData.video);
                          const audioBase64 = await toBase64(editData.audio);
                          const payload = {
                            title: editData.title,
                            body: editData.body,
                            image:
                              editData.image && typeof editData.image !== "string"
                                ? imageBase64
                                : editData.image === originalMedia.image
                                  ? null
                                  : imageBase64,
                            video:
                              editData.video && typeof editData.video !== "string"
                                ? videoBase64
                                : editData.video === originalMedia.video
                                  ? null
                                  : videoBase64,
                            audio:
                              editData.audio && typeof editData.audio !== "string"
                                ? audioBase64
                                : editData.audio === originalMedia.audio
                                  ? null
                                  : audioBase64,
                            status: newStatus,
                          };
                          const res = await fetch(`${API_BASE}/posts/${postId}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          });
                          const j = await res.json();
                          if (j.success) {
                            alert(
                              newStatus === "Hidden"
                                ? "Bài viết đã được ẩn."
                                : "Bài viết đã được hiển thị lại."
                            );
                            setPost({ ...post, status: newStatus });
                          } else {
                            alert(j.message);
                          }
                        } catch (err) {
                          console.error("Ẩn/hiện lỗi:", err);
                          alert("Không thể thay đổi trạng thái bài viết.");
                        } finally {
                          setShowMenu(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 ${post.status === "Approved" || post.status === "Hidden"
                        ? "text-gray-700 hover:bg-gray-50"
                        : "text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      disabled={post.status !== "Approved" && post.status !== "Hidden"}
                    >
                      {post.status === "Hidden" ? "Hiển thị lại" : "Ẩn bài viết"}
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
                        try {
                          const token = localStorage.getItem("token");
                          if (!token) return alert("Bạn cần đăng nhập!");
                          const res = await fetch(`${API_BASE}/posts/${postId}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          const j = await res.json();
                          if (j.success) {
                            alert("Đã xóa bài viết.");
                            navigate(`/profile/${userInfo.id}`);
                          } else alert(j.message);
                        } catch (err) {
                          console.error("Lỗi xóa:", err);
                          alert("Không thể xóa bài viết.");
                        } finally {
                          setShowMenu(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Xóa bài viết
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="px-8 py-6">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-3xl font-bold text-gray-900 mb-3 border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-600"
              />
            ) : (
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>
            )}
            {isOwner && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${post.status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : post.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : post.status === "Hidden"
                      ? "bg-gray-200 text-gray-700"
                      : post.status === "Banned"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
              >
                {post.status === "Approved"
                  ? "Đã duyệt"
                  : post.status === "Pending"
                    ? "Chờ phê duyệt"
                    : post.status === "Hidden"
                      ? "Đã ẩn"
                      : post.status === "Banned"
                        ? "Bị cấm"
                        : post.status}
              </span>
            )}
          </div>

          {/* Author */}
          <div className="px-8 pb-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar || logo}
                alt={post.author}
                onClick={() => navigate(`/profile/${post.authorRole === "admin" ? post.admin_id : post.user_id}?role=${post.authorRole}`)}
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
              <div>
                <p
                  onClick={() => navigate(`/profile/${post.authorRole === "admin" ? post.admin_id : post.user_id}?role=${post.authorRole}`)}
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
          </div>

          {/* Media */}
          <div className="px-8 pt-6 space-y-4">
            {isEditing ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="font-medium text-gray-700">Ảnh</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditData({ ...editData, image: e.target.files[0] })}
                      className="mt-2 block w-full"
                    />
                  </div>
                  {editData.image && typeof editData.image === "string" && (
                    <div className="flex flex-col items-center">
                      <img
                        src={editData.image}
                        alt="preview"
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <label className="mt-1 text-sm text-red-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteFlags.image}
                          onChange={(e) =>
                            setDeleteFlags({ ...deleteFlags, image: e.target.checked })
                          }
                        />{" "}
                        Xóa
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="font-medium text-gray-700">Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setEditData({ ...editData, video: e.target.files[0] })}
                      className="mt-2 block w-full"
                    />
                  </div>
                  {editData.video && typeof editData.video === "string" && (
                    <div className="flex flex-col items-center">
                      <video
                        src={editData.video}
                        controls
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <label className="mt-1 text-sm text-red-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteFlags.video}
                          onChange={(e) =>
                            setDeleteFlags({ ...deleteFlags, video: e.target.checked })
                          }
                        />{" "}
                        Xóa
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="font-medium text-gray-700">Âm thanh</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setEditData({ ...editData, audio: e.target.files[0] })}
                      className="mt-2 block w-full"
                    />
                  </div>
                  {editData.audio && typeof editData.audio === "string" && (
                    <div className="flex flex-col items-center">
                      <audio
                        src={editData.audio}
                        controls
                        className="w-32 h-10 rounded-lg"
                      />
                      <label className="mt-1 text-sm text-red-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteFlags.audio}
                          onChange={(e) =>
                            setDeleteFlags({ ...deleteFlags, audio: e.target.checked })
                          }
                        />{" "}
                        Xóa
                      </label>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full max-h-[480px] object-cover rounded-lg mb-6"
                  />
                )}
                {post.video && (
                  <video src={post.video} controls className="w-full rounded-lg mb-6" />
                )}
                {post.audio && (
                  <audio src={post.audio} controls className="w-full rounded-lg mb-6" />
                )}
              </>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {isEditing ? (
              <textarea
                value={editData.body}
                onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                placeholder="Nhập nội dung bài viết..."
                className="w-full min-h-[200px] text-gray-800 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            ) : (
              <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
                {post.body}
              </div>
            )}

            {isEditing && (
              <div className="px-8 pb-8 flex gap-4 mt-6">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      if (!token) return alert("Bạn cần đăng nhập!");
                      const toBase64 = (file) =>
                        new Promise((resolve, reject) => {
                          if (!file) return resolve(null);
                          if (typeof file === "string") return resolve(file);
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result);
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        });
                      const imageBase64 = await toBase64(editData.image);
                      const videoBase64 = await toBase64(editData.video);
                      const audioBase64 = await toBase64(editData.audio);
                      const res = await fetch(`${API_BASE}/posts/${postId}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          title: editData.title,
                          body: editData.body,
                          image: imageBase64,
                          video: videoBase64,
                          audio: audioBase64,
                          deleteImage: deleteFlags.image,
                          deleteVideo: deleteFlags.video,
                          deleteAudio: deleteFlags.audio,
                        }),
                      });
                      const j = await res.json();
                      if (j.success) {
                        alert("Cập nhật bài viết thành công!");
                        const updatedRes = await fetch(`${API_BASE}/posts/${postId}`, {
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });
                        const updatedData = await updatedRes.json();
                        if (updatedData.success) {
                          setPost(updatedData.data);
                        } else {
                          console.warn("Không thể fetch lại bài viết sau khi cập nhật.");
                        }
                        setIsEditing(false);
                        setDeleteFlags({ image: false, video: false, audio: false });
                      } else {
                        alert(j.message);
                      }
                    } catch (err) {
                      console.error("Lỗi lưu bài viết:", err);
                      alert("Không thể lưu thay đổi.");
                    }
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      title: post.title,
                      body: post.body,
                      image: post.image,
                      video: post.video,
                      audio: post.audio,
                    });
                    setDeleteFlags({ image: false, video: false, audio: false });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            )}
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
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition"
                  onClick={() => {
                    fetchSharedUsers();
                    setShowSharedUsers(true);
                  }}
                >
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
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${API_BASE}/share`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ post_id: postId }),
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
              Bình luận ({countAllComments(comments)})
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
                          const token = localStorage.getItem("token");
                          const res = await fetch(`${API_BASE}/comments`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              post_id: postId,
                              body: commentText,
                              parent_id: null,
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
        {showSharedUsers && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-96 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h2 className="text-lg font-bold text-gray-800">
                  Người đã chia sẻ bài viết
                </h2>
                <button
                  onClick={() => setShowSharedUsers(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              {sharedUsers.length === 0 ? (
                <p className="p-4 text-center text-gray-500">
                  Chưa có ai chia sẻ bài viết này.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sharedUsers.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => {
                        setShowSharedUsers(false);
                        navigate(`/profile/${u.id}`);
                      }}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 hover:text-indigo-600 transition">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400 italic">
                          Đã chia sẻ: {u.sharedAt}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
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
        onClick={() => navigate(`/profile/${comment.user_id}`)}
        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
      />
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span
              onClick={() => navigate(`/profile/${comment.user_id}`)}
              className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition"
            >
              {comment.userName}
            </span>
            <span className="text-xs text-gray-500">{comment.created_at}</span>
          </div>
          <p className="text-gray-700">{comment.body}</p>

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
                      const token = localStorage.getItem("token");
                      const res = await fetch(`${API_BASE}/comments`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          post_id: postId,
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
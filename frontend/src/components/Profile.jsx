import { useEffect, useState } from 'react';
import {
  User, Mail, Lock, Calendar, Edit2, Save, X,
  Camera, FileText, MessageSquare, Settings, Phone, Share
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import axios from 'axios';
import logo from '../images/logo.png';
import Dialog from "./Dialog";

const API_BASE = `http://${window.location.hostname}:5000`;

const Profile = ({ userInfo, onUpdateUser }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSelf, setIsSelf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showList, setShowList] = useState(null);
  const [listData, setListData] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const openDialog = (title, message, onConfirm = null) => {
    setDialog({ open: true, title, message, onConfirm });
  };
  const closeDialog = () => {
    setDialog({ open: false, title: "", message: "", onConfirm: null });
  };

  useEffect(() => {
    const fetchUserPosts = async (viewedUserId, isSelf, viewedRole) => {
      try {
        const statusParam = isSelf ? "all" : "Approved";
        const res = await axios.get(`${API_BASE}/posts?status=${statusParam}`);
        if (res.data.success) {
          const filtered = res.data.data.filter((p) => {
            if (viewedRole === "admin") {
              return p.admin_id === viewedUserId && p.authorRole === "admin";
            }
            return p.user_id === viewedUserId && p.authorRole === "user";
          });
          setUserPosts(filtered);
        }
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        openDialog("Thông báo", "Bạn chưa đăng nhập.", () => navigate("/login"));
        return;
      }
      try {
        const params = new URLSearchParams(window.location.search);
        const viewedRole = params.get("role") || userInfo.role || "user";
        const url = id
          ? `${API_BASE}/profile/${id}?role=${viewedRole}`
          : `${API_BASE}/profile`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const u = res.data.user;
          const self =
            (!id || parseInt(id) === userInfo?.id) &&
            ((u.role || viewedRole) === userInfo?.role);
          setIsSelf(self);
          const [followersRes, followingRes] = await Promise.all([
            axios.get(`${API_BASE}/follow/followers/${u.id}?role=${viewedRole}`),
            axios.get(`${API_BASE}/follow/following/${u.id}?role=${viewedRole}`)
          ]);
          const followersCount = followersRes.data?.count ?? (followersRes.data?.data?.length ?? 0);
          const followingCount = followingRes.data?.count ?? (followingRes.data?.data?.length ?? 0);
          setProfileData({
            id: u.id,
            name: u.full_name,
            email: u.email,
            phone: u.phone || "",
            avatar: u.avatar
              ? `data:image/jpeg;base64,${u.avatar}`
              : "https://i.pravatar.cc/150",
            gender: u.gender,
            birthDate: u.date_of_birth,
            joinDate: u.created_at
              ? new Date(u.created_at).toLocaleDateString("vi-VN")
              : "Không rõ",
            followers: followersCount,
            following: followingCount,
            role: u.role || viewedRole,
            is_banned: u.is_banned || false,
          });
          fetchUserPosts(u.id, self, u.role);
          fetchSharedPosts(u.id, u.role);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin người dùng:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSharedPosts = async (userId, role) => {
      try {
        const res = await axios.get(`${API_BASE}/share/${userId}?role=${role}`);
        if (res.data.success) setSharedPosts(res.data.data);
      } catch (err) {
        console.error("Lỗi tải bài viết chia sẻ:", err);
      }
    };
    fetchProfile();
  }, [userInfo, userInfo?.role, navigate, id]);

  useEffect(() => {
    if (!id || !userInfo?.id || !profileData?.role) return;
    const checkIfFollowing = async () => {
      try {
        const res = await axios.get(`${API_BASE}/follow/followers/${id}?role=${profileData.role}`);
        if (res.data.success) {
          const is = res.data.data.some(
            (f) => f.id === userInfo.id && f.role === userInfo.role
          );
          setIsFollowing(is);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái theo dõi:", err);
      }
    };
    checkIfFollowing();
  }, [userInfo?.id, userInfo?.role, navigate, id, profileData?.role]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      openDialog("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        full_name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        date_of_birth: profileData.birthDate,
        currentPassword: profileData.currentPassword || undefined,
        password: newPassword || undefined,
        avatar: profileData.avatar?.startsWith("data:image")
          ? profileData.avatar
          : undefined,
      };
      const res = await axios.put(
        `${API_BASE}/profile/${profileData.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        openDialog("Thành công", "Cập nhật thành công!");
        setIsEditing(false);
        onUpdateUser({
          name: profileData.name,
          email: profileData.email,
        });
      } else {
        openDialog("Lỗi", "Không thể cập nhật thông tin.");
      }
    } catch (err) {
      console.error('Lỗi cập nhật thông tin:', err);
      openDialog("Lỗi", "Có lỗi khi cập nhật hồ sơ.");
    } finally {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg">Không tìm thấy thông tin người dùng.</p>
      </div>
    );
  }

  const fetchFollowList = async (type) => {
    try {
      const res = await axios.get(
        `${API_BASE}/follow/${type}/${profileData.id}?role=${profileData.role}`
      );
      if (res.data.success) {
        setListData(res.data.data);
        setShowList(type);
      }
    } catch (err) {
      console.error(`Lỗi lấy danh sách ${type}:`, err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <img
              onClick={() => navigate('/')}
              className="h-20 w-auto cursor-pointer"
              src={logo}
              alt="8Express Logo"
            />
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-xl font-bold text-gray-600 hover:text-gray-900 transition"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                {profileData.role === "admin" && (
                  <span className="px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
                    Quản trị viên
                  </span>
                )}
                {profileData.role === "user" && profileData.is_banned && (
                  <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-full border border-red-300">
                    Bị cấm
                  </span>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                {isSelf ? (
                  isEditing ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        <Save size={18} /> Lưu
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        <X size={18} /> Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setActiveTab('info');
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Edit2 size={18} /> Chỉnh sửa
                    </button>
                  )
                ) : (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (!token) {
                        openDialog("Thông báo", "Bạn cần đăng nhập để theo dõi người khác!", () => navigate("/login"));
                        return;
                      }
                      try {
                        if (isFollowing) {
                          await axios.delete(
                            `${API_BASE}/follow/${profileData.id}?targetRole=${profileData.role}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setIsFollowing(false);
                        } else {
                          await axios.post(
                            `${API_BASE}/follow/${profileData.id}?targetRole=${profileData.role}`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setIsFollowing(true);
                        }
                        try {
                          const [followersRes, followingRes] = await Promise.all([
                            axios.get(`${API_BASE}/follow/followers/${profileData.id}?role=${profileData.role}`),
                            axios.get(`${API_BASE}/follow/following/${profileData.id}?role=${profileData.role}`),
                          ]);
                          setProfileData((prev) => ({
                            ...prev,
                            followers: followersRes.data?.count ?? (followersRes.data?.data?.length ?? 0),
                            following: followingRes.data?.count ?? (followingRes.data?.data?.length ?? 0),
                          }));
                        } catch (err) {
                          console.error("Không thể đồng bộ lại follower count:", err);
                        }
                      } catch (err) {
                        console.error("Lỗi khi theo dõi/hủy theo dõi:", err);
                        openDialog("Lỗi", err.response?.data?.message || "Lỗi khi thực hiện theo dõi");
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
                <p className="text-sm text-gray-600">Bài viết</p>
              </div>
              <div
                onClick={() => fetchFollowList('followers')}
                className="text-center cursor-pointer hover:text-indigo-600 transition"
              >
                <p className="text-2xl font-bold text-gray-900">{profileData.followers || 0}</p>
                <p className="text-sm text-gray-600">Người theo dõi</p>
              </div>
              <div
                onClick={() => fetchFollowList('following')}
                className="text-center cursor-pointer hover:text-indigo-600 transition"
              >
                <p className="text-2xl font-bold text-gray-900">{profileData.following || 0}</p>
                <p className="text-sm text-gray-600">Đang theo dõi</p>
              </div>
            </div>
          </div>
          {showList && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-96 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h2 className="text-lg font-bold text-gray-800">
                    {showList === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
                  </h2>
                  <button
                    onClick={() => setShowList(null)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>
                {listData.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">Chưa có dữ liệu</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {listData.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => {
                          setShowList(null);
                          navigate(`/profile/${user.id}?role=${user.role}`);
                        }}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <img
                          src={
                            user.avatar
                              ? `data:image/jpeg;base64,${user.avatar}`
                              : "https://i.pravatar.cc/50"
                          }
                          alt={user.full_name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowList(null);
                            navigate(`/profile/${user.id}?role=${user.role}`);
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition"
                        />
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowList(null);
                            navigate(`/profile/${user.id}?role=${user.role}`);
                          }}
                          className="flex-1"
                        >
                          <p className="font-medium text-gray-900 hover:text-indigo-600 transition">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'posts'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FileText size={18} className="inline mr-2 -mt-0.5" />
              Bài viết đã đăng
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'shares'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Share size={18} className="inline mr-2 -mt-0.5" />
              Bài viết đã chia sẻ
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'info'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Settings size={18} className="inline mr-2 -mt-0.5" />
              Thông tin cá nhân
            </button>
          </div>
        </div>
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map(post => {
              const hasImage = post.image && post.image.startsWith("data:image");
              const hasVideo = post.video && post.video.startsWith("data:video");
              const hasAudio = post.audio && post.audio.startsWith("data:audio");
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group"
                >
                  {hasImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                          {post.topic}
                        </span>
                      </div>
                    </div>
                  ) : hasVideo ? (
                    <div className="relative h-48 overflow-hidden bg-black">
                      <video src={post.video} controls className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                          {post.topic}
                        </span>
                      </div>
                    </div>
                  ) : hasAudio ? (
                    <div className="relative p-4 bg-gray-50 border-b border-gray-100">
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                          {post.topic}
                        </span>
                      </div>
                      <audio controls className="w-full mt-6" src={post.audio} />
                    </div>
                  ) : (
                    <div className="p-4">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                        {post.topic}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition whitespace-pre-line">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{post.author}</span>
                      <span>{new Date(post.publishedAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                      {post.body || ""}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.reactions &&
                          post.reactions
                            .filter(r => r.count > 0)
                            .map((r, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <span>{r.icon}</span>
                                <span>{r.count}</span>
                              </span>
                            ))}
                      </div>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} /> {post.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share size={14} /> {post.shareCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'shares' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedPosts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">
                Chưa có bài viết nào được chia sẻ.
              </p>
            ) : (
              sharedPosts.map((post) => {
                const hasImage = post.image && post.image.startsWith("data:image");
                const hasVideo = post.video && post.video.startsWith("data:video");
                const hasAudio = post.audio && post.audio.startsWith("data:audio");
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group"
                  >
                    {hasImage ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                            {post.topic}
                          </span>
                        </div>
                      </div>
                    ) : hasVideo ? (
                      <div className="relative h-48 overflow-hidden bg-black">
                        <video src={post.video} controls className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                            {post.topic}
                          </span>
                        </div>
                      </div>
                    ) : hasAudio ? (
                      <div className="relative p-4 bg-gray-50 border-b border-gray-100">
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                            {post.topic}
                          </span>
                        </div>
                        <audio controls className="w-full mt-6" src={post.audio} />
                      </div>
                    ) : (
                      <div className="p-4">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          {post.topic}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition whitespace-pre-line">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{post.author}</span>
                        <span>
                          {new Date(post.publishedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                        {post.body}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="italic text-indigo-600">
                          Đã chia sẻ: {new Date(post.sharedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Thông tin cá nhân
            </h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.name}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.phone}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Giới tính
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.gender}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.birthDate}</p>
                )}
              </div>
              {isEditing && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} />
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      value={profileData.currentPassword || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu hiện tại (Để trống nếu không đổi mật khẩu)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} />
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (Để trống nếu không đổi mật khẩu)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} />
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới (Để trống nếu không đổi mật khẩu)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.email}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Ngày tham gia
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.joinDate}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {dialog.open && (
        <Dialog
          title={dialog.title}
          message={dialog.message}
          onClose={closeDialog}
          onConfirm={dialog.onConfirm}
        />
      )}
    </div>
  );
};

export default Profile;
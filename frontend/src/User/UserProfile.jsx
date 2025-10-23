import React, { useState } from 'react';
import { 
  User, Mail, Lock, Calendar, MapPin, Edit2, Save, X, 
  Camera, FileText, Heart, Eye, MessageSquare, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../Images/Logo.png';

const UserProfile = ({ userInfo, onUpdateUser }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || 'Nguyễn Văn A',
    nickname: userInfo?.nickname || '@gamtram___',
    email: userInfo?.email || 'user@8express.com',
    avatar: userInfo?.avatar || 'https://i.pravatar.cc/150?img=1',
    bio: 'Đam mê viết lách và chia sẻ kiến thức',
    birthDate: '15/05/1995',
    location: 'Hà Nội, Việt Nam',
    joinDate: '01/01/2024'
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Bài viết của user (mock data)
  const [userPosts] = useState([
    {
      id: 1,
      title: 'Bài số 7: Giấy đăng ký kết hôn có thực sự là cam kết cho tình yêu?',
      category: 'THINKING OUT LOUD',
      excerpt: 'rất khó diễn tả',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
      author: 'gamtram___',
      authorAvatar: 'https://i.pravatar.cc/150?img=1',
      timeAgo: '17 giờ trước',
      views: 234,
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      title: 'Hướng dẫn sử dụng React Hooks hiệu quả',
      category: 'LẬP TRÌNH',
      excerpt: 'Tổng hợp các best practices khi làm việc với React Hooks',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      author: 'gamtram___',
      authorAvatar: 'https://i.pravatar.cc/150?img=1',
      timeAgo: '2 ngày trước',
      views: 456,
      likes: 28,
      comments: 12
    },
    {
      id: 3,
      title: 'Những cuốn sách nên đọc trong năm 2025',
      category: 'SÁCH & VĂN HÓA',
      excerpt: 'Top 10 cuốn sách hay nhất theo đánh giá cá nhân',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      author: 'gamtram___',
      authorAvatar: 'https://i.pravatar.cc/150?img=1',
      timeAgo: '1 tuần trước',
      views: 789,
      likes: 45,
      comments: 23
    }
  ]);

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

  const handleSaveProfile = () => {
    // Kiểm tra password nếu có thay đổi
    if (newPassword && newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Cập nhật thông tin
    if (onUpdateUser) {
      onUpdateUser({
        ...profileData,
        password: newPassword || undefined
      });
    }

    alert('Cập nhật thông tin thành công!');
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              class="px-4 py-2 text-xl font-bold text-gray-600 hover:text-gray-900 transition "
            >
               Trang chủ
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              {/* Avatar */}
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

              {/* Name & Bio */}
              <div className="flex-1 md:ml-6 mt-4 md:mt-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-2xl"
                    />
                    <input
                      type="text"
                      name="nickname"
                      value={profileData.nickname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
                      placeholder="@nickname"
                    />
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Tiểu sử ngắn..."
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600 mt-1">{profileData.nickname}</p>
                    <p className="text-gray-700 mt-2">{profileData.bio}</p>
                  </>
                )}
              </div>

              {/* Edit Button */}
              <div className="mt-4 md:mt-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Save size={18} />
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <X size={18} />
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Edit2 size={18} />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
                <p className="text-sm text-gray-600">Bài viết</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Người theo dõi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-sm text-gray-600">Đang theo dõi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'posts'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={18} className="inline mr-2 -mt-0.5" />
              Bài viết của tôi
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'info'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings size={18} className="inline mr-2 -mt-0.5" />
              Thông tin cá nhân
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          // Bài viết của user
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>

                  {/* Author & Time */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={post.authorAvatar} 
                        alt={post.author}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{post.author}</span>
                    </div>
                    <span>{post.timeAgo}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Thông tin cá nhân
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h3>
            
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.email}</p>
                )}
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.birthDate}</p>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Địa chỉ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.location}</p>
                )}
              </div>

              {/* Đổi mật khẩu */}
              {isEditing && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} />
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Để trống nếu không đổi"
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
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}

              {/* Ngày tham gia */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Ngày tham gia
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profileData.joinDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
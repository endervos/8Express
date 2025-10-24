import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Home as HomeIcon, TrendingUp, Sparkles, Book, Atom, Sun, Code,
  User, Eye, MessageSquare, ThumbsUp, Zap, Heart, LogOut, BarChart3
} from 'lucide-react';
import './Home.css';
import logo from '../Images/Logo.png';

const categoryIcons = { zap: Zap, book: Book, atom: Atom, sun: Sun, code: Code };

const PostCard = ({ post, onViewDetail, isFavorite, onToggleFavorite }) => (
  <div className="post-card group">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center text-sm text-gray-500">
        <User size={16} className="mr-1" />
        <span className="font-medium text-gray-700 hover:text-indigo-600 cursor-pointer">
          {post.author}
        </span>
        <span className="mx-2">•</span>
        <span>{post.category}</span>
        <span className="mx-2">•</span>
        <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(post.id); }}
        className="p-2 hover:bg-gray-100 rounded-full transition"
        title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
      >
        <Heart
          size={20}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
        />
      </button>
    </div>

    <div onClick={() => onViewDetail(post)} className="cursor-pointer">
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
        {post.title}
      </h3>
      <p className="text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>

      <div className="flex items-center text-sm text-gray-500 gap-4">
        <span className="flex items-center gap-1">
          <ThumbsUp size={16} /> {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={16} /> {post.views}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={16} /> {post.comments?.length || 0}
        </span>
      </div>
    </div>
  </div>
);

const Home = ({ isLoggedIn, userInfo, onLogout }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/posts')
      .then(res => {
        if (res.data.success) setPosts(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy posts:", err));

    axios.get('http://localhost:5000/topics')
      .then(res => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy topics:", err));
  }, []);

  const toggleFavorite = id => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleViewDetail = post => navigate(`/post/${post.id}`, { state: { post } });

  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => p.status === 'published');
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.author?.toLowerCase().includes(lower) ||
        p.excerpt?.toLowerCase().includes(lower)
      );
    }
    if (activeTab === 'hot') return [...list].sort((a, b) => b.views - a.views);
    if (activeTab === 'favorite') return list.filter(p => favorites.includes(p.id));
    return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [posts, activeCategory, activeTab, searchTerm, favorites]);

  const topPosts = useMemo(() => [...posts].sort((a, b) => b.views - a.views).slice(0, 5), [posts])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img
                onClick={() => navigate('/')}
                className="h-20 w-auto cursor-pointer"
                src={logo}
                alt="8Express Logo"

              />
              <nav className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-indigo-600 font-semibold border-b-2 border-indigo-600"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => isLoggedIn ? navigate('/write') : navigate('/login')}
                  className="text-gray-600 hover:text-indigo-600 transition"
                >
                  Viết bài
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden lg:block">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {userInfo?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition"
                    >
                      <BarChart3 size={16} />
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline font-medium">{userInfo?.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      navigate('/');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} className="text-red-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-md"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="text-lg font-bold text-center text-gray-800 border-b pb-3 mb-3">Chủ đề phổ biến</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition ${!activeCategory ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <HomeIcon size={18} />
                    Tất cả bài viết
                  </span>
                </button>
                {categories.map(cat => {
                  const Icon = categoryIcons[cat.icon] || Book;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition ${activeCategory === cat.name ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={18} />
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-500">{cat.postCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Center Content - Posts */}
          <main className="lg:col-span-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl shadow-sm">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'new' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Sparkles size={18} className="inline mr-1 -mt-0.5" /> Mới nhất
              </button>
              <button
                onClick={() => setActiveTab('hot')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'hot' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <TrendingUp size={18} className="inline mr-1 -mt-0.5" /> Nổi bật
              </button>
              <button
                onClick={() => setActiveTab('favorite')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'favorite' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Heart size={18} className="inline mr-1 -mt-0.5" /> Yêu thích ({favorites.length})
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewDetail={handleViewDetail}
                    isFavorite={favorites.includes(post.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))
              ) : (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">
                    {activeTab === 'favorite'
                      ? 'Bạn chưa có bài viết yêu thích nào.'
                      : 'Không tìm thấy bài viết nào phù hợp.'}
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 space-y-6">
              {/* Top Posts */}
              <div>
                <h4 className="text-lg font-bold text-center text-gray-800 border-b pb-3 mb-3">Bài viết phổ biến</h4>
                <div className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handleViewDetail(post)}
                      className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Authors */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 border-b pb-3 mb-3">Tác giả nổi bật</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                      <img
                        src={`https://i.pravatar.cc/150?img=${i + 10}`}
                        alt={`User ${i}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">Tác giả {i}</p>
                        <p className="text-sm text-gray-500">@user{i}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-indigo-400">8Express</h3>
              <p className="text-gray-400 text-sm mb-4">
                Nền tảng chia sẻ kiến thức và kết nối cộng đồng người Việt.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition">Về chúng tôi</button></li>
                <li><button className="hover:text-white transition">Điều khoản sử dụng</button></li>
                <li><button className="hover:text-white transition">Chính sách bảo mật</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Chủ đề</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition">Công nghệ</button></li>
                <li><button className="hover:text-white transition">Lập trình</button></li>
                <li><button className="hover:text-white transition">Khoa học</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Nhận bản tin</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm transition">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} 8Express Forum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
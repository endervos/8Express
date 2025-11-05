import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Home as HomeIcon, TrendingUp, Sparkles, Book, Atom, Sun, Code,
  User, MessageSquare, Zap, Heart, LogOut, BarChart3, Share
} from 'lucide-react';
import './Home.css';
import logo from '../images/logo.png';

const categoryIcons = { zap: Zap, book: Book, atom: Atom, sun: Sun, code: Code };

const PostCard = ({ post, onViewDetail, navigate }) => {
  const reactions = post.reactions || [];

  return (
    <div className="post-card group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm text-gray-500">
          <User size={16} className="mr-1" />
          <span
            onClick={() =>
              navigate(
                `/profile/${post.authorRole === "admin" ? post.admin_id : post.user_id}?role=${post.authorRole || "user"
                }`
              )
            }
            className="font-medium text-gray-700 hover:text-indigo-600 cursor-pointer"
          >
            {post.author}
          </span>
          <span className="mx-2">•</span>
          <span>{post.category}</span>
          <span className="mx-2">•</span>
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

      <div onClick={() => onViewDetail(post)} className="cursor-pointer">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 whitespace-pre-line">{post.body}</p>

        <div className="flex items-center text-sm text-gray-500 gap-4">
          {/* Hiển thị toàn bộ cảm xúc */}
          <div className="flex flex-wrap items-center gap-2">
            {reactions
              .filter(r => r.count > 0)
              .map((r, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-lg">{r.icon}</span>
                  <span>{r.count}</span>
                </span>
              ))}
          </div>

          {/* Bình luận */}
          <span className="flex items-center gap-1">
            <MessageSquare size={16} /> {post.comments || 0}
          </span>

          {/* Chia sẻ */}
          <span className="flex items-center gap-1">
            <Share size={16} /> {post.shareCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const Home = ({ isLoggedIn, userInfo, onLogout }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [interacted, setInteracted] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/posts?status=Approved')
      .then(res => {
        if (res.data.success) setPosts(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy posts:", err));

    axios.get('http://localhost:5000/topics')
      .then(res => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy topics:", err));

    axios.get('http://localhost:5000/profile/top-authors/all')
      .then(res => {
        if (res.data.success) setTopAuthors(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy top authors:", err));
  }, []);

  useEffect(() => {
    const fetchInteracted = async () => {
      if (!isLoggedIn || !userInfo?.id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/posts/interacted/${userInfo.id}?role=${userInfo.role}`
        );
        if (res.data.success) {
          const approved = res.data.data.filter(p => p.status === "Approved");
          setInteracted(approved);
        }
      } catch (err) {
        console.error("Lỗi lấy bài viết đã tương tác:", err);
      }
    };

    fetchInteracted();
  }, [isLoggedIn, userInfo]);

  const toggleInteracted = id => {
    setInteracted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleViewDetail = post => navigate(`/post/${post.id}`, { state: { post } });

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeCategory, searchTerm]);

  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => p.status === 'Approved');

    if (activeCategory) {
      list = list.filter(p => p.category === activeCategory);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.author?.toLowerCase().includes(lower) ||
        p.body?.toLowerCase().includes(lower)
      );
    }

    if (activeTab === 'hot') {
      return [...list].sort((a, b) => {
        const scoreA =
          (a.reactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0) +
          (a.comments || 0) +
          (a.shareCount || 0);
        const scoreB =
          (b.reactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0) +
          (b.comments || 0) +
          (b.shareCount || 0);
        return scoreB - scoreA;
      });
    }

    if (activeTab === 'interacted') {
      let favList = interacted.filter(p => p.status === 'Approved');
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        favList = favList.filter(p =>
          p.title.toLowerCase().includes(lower) ||
          p.author?.toLowerCase().includes(lower) ||
          p.body?.toLowerCase().includes(lower)
        );
      }
      if (activeCategory) {
        favList = favList.filter(p => p.category === activeCategory);
      }
      return favList;
    }

    return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [posts, activeCategory, activeTab, searchTerm, interacted]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const topPosts = useMemo(() => [...posts]
    .filter(p => p.status === 'Approved')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5), [posts]);

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
                    <span className="font-medium text-gray-800">
                      {userInfo?.name || userInfo?.full_name || "Tài khoản"}
                    </span>
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
                onClick={() => setActiveTab('interacted')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'interacted' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Heart size={18} className="inline mr-1 -mt-0.5" /> Đã tương tác ({interacted.length})
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewDetail={handleViewDetail}
                    navigate={navigate}
                    isInteracted={interacted.includes(post.id)}
                    onToggleInteracted={toggleInteracted}
                  />
                ))
              ) : (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">
                    {activeTab === 'interacted'
                      ? 'Chưa có bài viết đã tương tác nào.'
                      : 'Không tìm thấy bài viết nào phù hợp.'}
                  </p>
                </div>
              )}
              {filteredPosts.length > postsPerPage && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md ${currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
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
                        <p className="font-medium text-gray-800 text-sm mb-1 whitespace-pre-line">
                          {post.title}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {/* Hiển thị tất cả cảm xúc */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {post.reactions &&
                              post.reactions
                                .filter(r => r.count > 0)
                                .map((r, i) => (
                                  <span key={i} className="flex items-center gap-0.5">
                                    <span>{r.icon}</span>
                                    <span>{r.count}</span>
                                  </span>
                                ))}
                          </div>
                          {/* Bình luận */}
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comments || 0}
                          </span>

                          {/* Chia sẻ */}
                          <span className="flex items-center gap-1">
                            <Share size={12} />
                            {post.shareCount || 0}
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
                  {topAuthors.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/profile/${a.id}?role=${a.role}`)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    >
                      <img
                        src={a.avatar || '/default-avatar.png'}
                        alt={a.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${a.id}?role=${a.role}`);
                        }}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition"
                      />
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${a.id}?role=${a.role}`);
                        }}
                      >
                        <p className="font-semibold text-gray-800 hover:text-indigo-600 transition">
                          {a.name}
                        </p>
                        <p className="text-sm text-gray-500">{a.postCount} bài viết</p>
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
              {categories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: Math.ceil(categories.length / 5) }, (_, colIndex) => (
                    <ul key={colIndex} className="space-y-2 text-sm text-gray-400">
                      {categories
                        .slice(colIndex * 5, colIndex * 5 + 5)
                        .map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => {
                                setActiveCategory(cat.name);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="hover:text-white transition text-left w-full"
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Đang tải chủ đề...</p>
              )}
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
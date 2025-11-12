import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Home as HomeIcon, TrendingUp, Sparkles, Book, Atom, Sun, Code,
  User, MessageSquare, Zap, Heart, LogOut, BarChart3, Share, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Home.css';
import logo from '../images/logo.png';

const topicIcons = { zap: Zap, book: Book, atom: Atom, sun: Sun, code: Code };

const PostCard = ({ post, onViewDetail, navigate }) => {
  const reactions = post.reactions || [];

  return (
    <div className="post-card group featured-post-card">
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
          <span>{post.topic}</span>
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
          <span className="flex items-center gap-1">
            <MessageSquare size={16} /> {post.comments || 0}
          </span>
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
  const [activeTopic, setActiveTopic] = useState(null);
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
  }, [activeTab, activeTopic, searchTerm]);

  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => p.status === 'Approved');

    if (activeTopic) {
      list = list.filter(p => p.topic === activeTopic);
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
      if (activeTopic) {
        favList = favList.filter(p => p.topic === activeTopic);
      }
      return favList;
    }

    return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [posts, activeTopic, activeTab, searchTerm, interacted]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const topPosts = useMemo(() => [...posts]
    .filter(p => p.status === 'Approved')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5), [posts]);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-button px-4 py-2 rounded-lg text-sm transition-all ${currentPage === i
            ? "active text-white"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img
                onClick={() => navigate('/')}
                className="h-14 w-auto cursor-pointer"
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
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
              <h4 className="text-lg font-bold text-center pb-3 mb-3 border-b category-title section-header-accent">
                Chủ đề phổ biến
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTopic(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition ${!activeTopic ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <HomeIcon size={18} />
                    Tất cả bài viết
                  </span>
                </button>
                {categories.map(cat => {
                  const Icon = topicIcons[cat.icon] || Book;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTopic(cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition ${activeTopic === cat.name ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
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
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'new' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'
                  }`}
              >
                <Sparkles size={18} className="inline mr-1 -mt-0.5" /> Mới nhất
              </button>
              <button
                onClick={() => setActiveTab('hot')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'hot' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'
                  }`}
              >
                <TrendingUp size={18} className="inline mr-1 -mt-0.5" /> Nổi bật
              </button>
              <button
                onClick={() => setActiveTab('interacted')}
                className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'interacted' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'
                  }`}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  {renderPaginationButtons()}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Tiếp</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-24 space-y-6">
              {/* Top Posts */}
              <div>
                <h4 className="text-lg font-bold text-center pb-3 mb-3 border-b category-title section-header-accent">
                  Bài viết phổ biến
                </h4>
                <div className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handleViewDetail(post)}
                      className="popular-post-item flex gap-3 p-2 cursor-pointer transition"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm mb-1 whitespace-pre-line line-clamp-2">
                          {post.title}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
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
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comments || 0}
                          </span>
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
                <h4 className="text-lg font-bold pb-3 mb-3 border-b category-title section-header-accent">
                  Tác giả nổi bật
                </h4>
                <div className="space-y-3">
                  {topAuthors.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/profile/${a.id}?role=${a.role}`)}
                      className="flex items-center gap-3 p-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg cursor-pointer transition"
                    >
                      <img
                        src={a.avatar || '/default-avatar.png'}
                        alt={a.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${a.id}?role=${a.role}`);
                        }}
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 hover:opacity-80 transition"
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
      <footer className="mt-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="8Express" className="h-12 w-auto" />
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                Nền tảng chia sẻ kiến thức và kết nối cộng đồng người Việt.
                Nơi bạn có thể tìm thấy và chia sẻ những câu chuyện đáng giá.
              </p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Liên kết nhanh</h4>
              <ul className="space-y-3">
                <li>
                  <button className="text-indigo-200 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className=" bg-indigo-400 group-hover:bg-white transition"></span>
                    Về chúng tôi
                  </button>
                </li>
                <li>
                  <button className="text-indigo-200 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className=" bg-indigo-400 group-hover:bg-white transition"></span>
                    Điều khoản sử dụng
                  </button>
                </li>
                <li>
                  <button className="text-indigo-200 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className=" bg-indigo-400 group-hover:bg-white transition"></span>
                    Chính sách bảo mật
                  </button>
                </li>
                <li>
                  <button className="text-indigo-200 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className=" bg-indigo-400 group-hover:bg-white transition"></span>
                    Liên hệ
                  </button>
                </li>
                <li>
                  <button className="text-indigo-200 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className=" bg-indigo-400 group-hover:bg-white transition"></span>
                    Hỗ trợ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Liên hệ hợp tác</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-indigo-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-indigo-300">Email:</span>
                  <a href="mailto:8expressnhom5@gmail.com" className="hover:text-white transition whitespace-nowrap">
                    8expressnhom5@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-indigo-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-indigo-300">Điện thoại:</span>
                  <a href="tel:+84978944558" className="hover:text-white transition whitespace-nowrap">
                    (+84) 978 944 558
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">8Express © Copyright 2025</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-indigo-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-indigo-300">Email:</span>
                  <a href="mailto:8expressnhom5@gmail.com" className="hover:text-white transition whitespace-nowrap">
                    8expressnhom5@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-indigo-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-indigo-300">Điện thoại:</span>
                  <a href="tel:+84978944558" className="hover:text-white transition whitespace-nowrap">
                    (+84) 978 944 558
                  </a>
                </li>
                <li className="flex items-start gap-3 text-indigo-200 text-sm">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-indigo-300 whitespace-nowrap">Địa chỉ:</span>
                  <p className="hover:text-white transition leading-relaxed">
                    97 Man Thiện, Hiệp Phú, Thủ Đức, Thành phố Hồ Chí Minh
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
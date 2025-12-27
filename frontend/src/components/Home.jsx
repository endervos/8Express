import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Home as HomeIcon, TrendingUp, Sparkles, Book, Atom, Sun, Code,
  User, MessageSquare, Zap, Heart, LogOut, BarChart3, Share, ChevronLeft, ChevronRight, Menu, Clock, Calendar
} from 'lucide-react';
import './Home.css';
import Logo from '../Images/logo.png';
import thumbnail from '../Images/thumbnail.png';

const API_BASE = `http://${window.location.hostname}:5000`;

const topicIcons = { zap: Zap, book: Book, atom: Atom, sun: Sun, code: Code };

const PostCard = ({ post, onViewDetail, navigate }) => {
  const reactions = post.reactions || [];
  const wordCount = post.body?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="post-card group featured-post-card">
      <div onClick={() => onViewDetail(post)} className="cursor-pointer">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap text-sm text-gray-500">
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/profile/${post.authorRole === "admin" ? post.admin_id : post.user_id}?role=${post.authorRole || "user"}`
                );
              }}
              className="font-semibold text-gray-700 hover:text-indigo-600 cursor-pointer flex items-center gap-1.5"
            >
              <User size={14} />
              {post.author}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-indigo-600 font-bold text-sm px-2.5 py-0.5 bg-indigo-50 rounded-full">
              {post.topic}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1 font-medium text-sm">
              <Clock size={13} />
              {readTime} phút đọc
            </span>
          </div>
          <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-indigo-600 transition line-clamp-2 leading-tight tracking-tight">
            {post.title}
          </h3>
          <p className="text-gray-700 text-sm lg:text-base mb-4 whitespace-pre-line line-clamp-3 leading-relaxed">
            {post.body}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {reactions
                .filter(r => r.count > 0)
                .map((r, i) => (
                  <span key={i} className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer bg-gray-50 px-2 py-1 rounded-full">
                    <span className="text-base">{r.icon}</span>
                    <span className="font-semibold text-xs">{r.count}</span>
                  </span>
                ))}
            </div>
            <span className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer bg-gray-50 px-2 py-1 rounded-full">
              <MessageSquare size={14} />
              <span className="font-semibold text-xs">{post.comments || 0}</span>
            </span>
            <span className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer bg-gray-50 px-2 py-1 rounded-full">
              <Share size={14} />
              <span className="font-semibold text-xs">{post.shareCount || 0}</span>
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden lg:block font-medium">
            {new Date(post.publishedAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ userInfo, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const getDefaultAvatar = () => {
    if (userInfo?.avatar) {
      return `data:image/jpeg;base64,${userInfo.avatar}`;
    }

    if (userInfo?.name || userInfo?.full_name) {
      const name = encodeURIComponent(userInfo.name || userInfo.full_name);
      const seed = userInfo?.id || 0;
      const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '00f2fe', 'fa709a', 'fee140'];
      const bgColor = colors[seed % colors.length];
      return `https://ui-avatars.com/api/?name=${name}&background=${bgColor}&color=fff&size=128`;
    }

    return Logo;
  };

  return (
    <img
      src={getDefaultAvatar()}
      alt={userInfo?.name || 'User'}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white`}
    />
  );
};

const MobileBottomNav = ({ isLoggedIn, userInfo, onLogout, navigate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <nav className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 ${scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => navigate('/')}
            className="mobile-bottom-nav-item"
          >
            <HomeIcon size={20} />
            <span className="mobile-bottom-nav-label">Trang chủ</span>
          </button>
          <button
            onClick={() => isLoggedIn ? navigate('/write') : navigate('/login')}
            className="mobile-bottom-nav-item"
          >
            <Sparkles size={20} />
            <span className="mobile-bottom-nav-label">Viết bài</span>
          </button>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="mobile-bottom-nav-item"
              >
                <User size={20} />
                <span className="mobile-bottom-nav-label">Hồ sơ</span>
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="mobile-bottom-nav-item relative"
              >
                <Menu size={20} />
                <span className="mobile-bottom-nav-label">Thêm</span>
                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] overflow-hidden">
                    {userInfo?.role === 'admin' && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                      >
                        <BarChart3 size={18} />
                        <span>Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        navigate('/');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition border-t"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="mobile-bottom-nav-item"
            >
              <User size={20} />
              <span className="mobile-bottom-nav-label">Đăng nhập</span>
            </button>
          )}
        </div>
      </nav>
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
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
  const [timeFilter, setTimeFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    axios.get(`${API_BASE}/posts?status=Approved`)
      .then(res => {
        if (res.data.success) setPosts(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy posts:", err));

    axios.get(`${API_BASE}/topics`)
      .then(res => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy topics:", err));

    axios.get(`${API_BASE}/profile/top-authors/all`)
      .then(res => {
        if (res.data.success) setTopAuthors(res.data.data);
      })
      .catch(err => console.error("Lỗi lấy top authors:", err));
  }, []);

  useEffect(() => {
    const fetchInteracted = async () => {
      if (!isLoggedIn || !userInfo?.id) return;
      try {
        const res = await axios.get(`${API_BASE}/posts/interacted/${userInfo.id}?role=${userInfo.role}`)
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
  }, [activeTab, activeTopic, searchTerm, timeFilter, customDateRange]);

  const filteredPosts = useMemo(() => {
    const getTimeFilteredPosts = (postList) => {
      if (timeFilter === 'all') return postList;

      const now = new Date();
      const filtered = postList.filter(post => {
        const publishDate = new Date(post.publishedAt);

        switch (timeFilter) {
          case 'today':
            return publishDate.toDateString() === now.toDateString();

          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return publishDate >= weekAgo;
          }

          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return publishDate >= monthAgo;
          }

          case 'custom': {
            if (!customDateRange.startDate && !customDateRange.endDate) return true;

            const start = customDateRange.startDate ? new Date(customDateRange.startDate) : null;
            const end = customDateRange.endDate ? new Date(customDateRange.endDate) : null;

            if (start && end) {
              end.setHours(23, 59, 59, 999);
              return publishDate >= start && publishDate <= end;
            } else if (start) {
              return publishDate >= start;
            } else if (end) {
              end.setHours(23, 59, 59, 999);
              return publishDate <= end;
            }
            return true;
          }

          default:
            return true;
        }
      });

      return filtered;
    };

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

    list = getTimeFilteredPosts(list);

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
      favList = getTimeFilteredPosts(favList);
      return favList;
    }

    return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [posts, activeTopic, activeTab, searchTerm, interacted, timeFilter, customDateRange]);

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
          className={`pagination-button px-4 lg:px-5 py-3 rounded-xl text-sm transition-all shadow-sm hover:shadow ${currentPage === i
            ? "active text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 lg:gap-6">
              <img
                onClick={() => navigate('/')}
                className="h-12 lg:h-14 w-auto cursor-pointer mobile-logo"
                src={Logo}
                alt="8Express Logo"
              />
              <nav className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => isLoggedIn ? navigate('/write') : navigate('/login')}
                  className="text-gray-600 hover:text-indigo-600 transition pb-1"
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
                <div className="hidden md:flex items-center gap-3">
                  {userInfo?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition"
                    >
                      <BarChart3 size={16} />
                      <span className="hidden lg:inline">Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <UserAvatar userInfo={userInfo} size="sm" />
                    <span className="font-medium text-gray-800 hidden lg:inline">
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
                  className="hidden md:block px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-md"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
          <div className="lg:hidden mt-3 mobile-search-container">
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
      <div className="w-full px-8 lg:px-16 xl:px-24 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 max-w-[1600px] mx-auto">
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h4 className="text-base font-bold text-gray-800 mb-4">
                Chủ đề
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTopic(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition text-sm ${!activeTopic ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <HomeIcon size={16} />
                    Tất cả
                  </span>
                </button>
                {categories.map(cat => {
                  const Icon = topicIcons[cat.icon] || Book;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTopic(cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition text-sm ${activeTopic === cat.name ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon size={16} />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="text-xs text-gray-400 font-normal ml-1">{cat.postCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
          <div className="lg:hidden mobile-categories-wrapper bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h4 className="text-base font-bold text-gray-800 mb-4">Chủ đề</h4>
            <div className="mobile-categories-scroll">
              <button
                onClick={() => setActiveTopic(null)}
                className={`mobile-category-chip ${!activeTopic ? 'active' : ''}`}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTopic(cat.name)}
                  className={`mobile-category-chip ${activeTopic === cat.name ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:hidden bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h4 className="text-base font-bold text-gray-800 mb-4">Bài viết phổ biến</h4>
            <div className="space-y-3">
              {topPosts.slice(0, 5).map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => handleViewDetail(post)}
                  className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm mb-1.5 line-clamp-2 leading-relaxed">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-base">
                      {post.reactions &&
                        post.reactions
                          .filter(r => r.count > 0)
                          .slice(0, 2)
                          .map((r, i) => (
                            <span key={i}>{r.icon}</span>
                          ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:hidden bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h4 className="text-base font-bold text-gray-800 mb-4">Tác giả nổi bật</h4>
            <div className="grid grid-cols-2 gap-3">
              {topAuthors.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/profile/${a.id}?role=${a.role}`)}
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl cursor-pointer transition hover:shadow-md"
                >
                  <img
                    src={a.avatar || '/default-avatar.png'}
                    alt={a.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-500">{a.postCount} bài</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <main className="lg:col-span-6">
            <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden mb-8 mobile-tabs">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 px-6 py-4 font-semibold transition text-sm lg:text-base ${activeTab === 'new' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Sparkles size={18} className="inline mr-2 -mt-0.5" />
                <span className="hidden sm:inline">Mới nhất</span>
                <span className="sm:hidden">Mới</span>
              </button>
              <button
                onClick={() => setActiveTab('hot')}
                className={`flex-1 px-6 py-4 font-semibold transition text-sm lg:text-base ${activeTab === 'hot' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <TrendingUp size={18} className="inline mr-2 -mt-0.5" />
                <span className="hidden sm:inline">Nổi bật</span>
                <span className="sm:hidden">Hot</span>
              </button>
              <button
                onClick={() => setActiveTab('interacted')}
                className={`flex-1 px-6 py-4 font-semibold transition text-sm lg:text-base ${activeTab === 'interacted' ? 'tab-active' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Heart size={18} className="inline mr-2 -mt-0.5" />
                <span className="hidden sm:inline">Đã tương tác ({interacted.length})</span>
                <span className="sm:hidden">Thích</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar size={18} className="text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-800">Lọc theo thời gian</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`time-filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`time-filter-btn ${timeFilter === 'today' ? 'active' : ''}`}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`time-filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                >
                  Tuần này
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`time-filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('custom');
                    setShowDatePicker(!showDatePicker);
                  }}
                  className={`time-filter-btn ${timeFilter === 'custom' ? 'active' : ''}`}
                >
                  Khoảng thời gian
                </button>
              </div>
              {showDatePicker && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCustomDateRange({ startDate: '', endDate: '' });
                      setTimeFilter('all');
                      setShowDatePicker(false);
                    }}
                    className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
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
                <div className="text-center p-16 bg-white rounded-2xl shadow-sm">
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'interacted'
                      ? 'Chưa có bài viết đã tương tác nào.'
                      : 'Không tìm thấy bài viết nào phù hợp.'}
                  </p>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2 flex-wrap mobile-pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button flex items-center gap-1 px-4 lg:px-5 py-3 bg-white rounded-xl text-sm disabled:opacity-40 shadow-sm hover:shadow transition"
                  >
                    <ChevronLeft size={16} />
                    <span className="desktop-text hidden sm:inline">Trước</span>
                  </button>
                  {renderPaginationButtons()}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button flex items-center gap-1 px-4 lg:px-5 py-3 bg-white rounded-xl text-sm disabled:opacity-40 shadow-sm hover:shadow transition"
                  >
                    <span className="desktop-text hidden sm:inline">Tiếp</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </main>
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 space-y-6">
              <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <img src={thumbnail} alt="8Express" className="h-auto w-auto mx-auto mb-2" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800 mb-4">
                  Bài viết phổ biến
                </h4>
                <div className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handleViewDetail(post)}
                      className="popular-post-item flex gap-2.5 p-2.5 cursor-pointer transition rounded-xl hover:bg-gray-50"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm mb-1.5 whitespace-pre-line line-clamp-2 leading-relaxed">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {post.reactions &&
                              post.reactions
                                .filter(r => r.count > 0)
                                .slice(0, 3)
                                .map((r, i) => (
                                  <span key={i} className="flex items-center gap-0.5">
                                    <span className="text-sm">{r.icon}</span>
                                    <span>{r.count}</span>
                                  </span>
                                ))}
                          </div>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare size={11} />
                            {post.comments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800 mb-4">
                  Tác giả nổi bật
                </h4>
                <div className="space-y-2.5">
                  {topAuthors.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/profile/${a.id}?role=${a.role}`)}
                      className="flex items-center gap-2.5 p-2.5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl cursor-pointer transition"
                    >
                      <img
                        src={a.avatar || '/default-avatar.png'}
                        alt={a.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 hover:text-indigo-600 transition text-sm truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-gray-500">{a.postCount} bài viết</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <footer className="mt-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mobile-footer-stack">
            <div className="lg:col-span-1 mobile-footer-section">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <img src={Logo} alt="8Express" className="h-12 w-auto" />
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                Nền tảng chia sẻ kiến thức và kết nối cộng đồng người Việt.
                Nơi bạn có thể tìm thấy và chia sẻ những câu chuyện đáng giá.
              </p>
              <div className="flex gap-3 justify-center lg:justify-start">
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
            <div className="mobile-footer-section">
              <h4 className="font-bold text-lg mb-4 lg:mb-6 text-white">Liên kết nhanh</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><button className="text-indigo-200 hover:text-white transition text-sm">Về chúng tôi</button></li>
                <li><button className="text-indigo-200 hover:text-white transition text-sm">Điều khoản sử dụng</button></li>
                <li><button className="text-indigo-200 hover:text-white transition text-sm">Chính sách bảo mật</button></li>
                <li><button className="text-indigo-200 hover:text-white transition text-sm">Liên hệ</button></li>
                <li><button className="text-indigo-200 hover:text-white transition text-sm">Hỗ trợ</button></li>
              </ul>
            </div>
            <div className="mobile-footer-section">
              <h4 className="font-bold text-lg mb-4 lg:mb-6 text-white">Liên hệ</h4>
              <ul className="space-y-2 lg:space-y-3 text-sm">
                <li className="text-indigo-200">
                  Email: <a href="mailto:8expressnhom5@gmail.com" className="hover:text-white transition">8expressnhom5@gmail.com</a>
                </li>
                <li className="text-indigo-200">
                  ĐT: <a href="tel:+84978944558" className="hover:text-white transition">(+84) 978 944 558</a>
                </li>
              </ul>
            </div>
            <div className="mobile-footer-section">
              <h4 className="font-bold text-lg mb-4 lg:mb-6 text-white">8Express © 2025</h4>
              <p className="text-indigo-200 text-sm leading-relaxed">
                97 Man Thiện, Hiệp Phú, Thủ Đức, TP. Hồ Chí Minh
              </p>
            </div>
          </div>
        </div>
      </footer>
      <MobileBottomNav
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        onLogout={onLogout}
        navigate={navigate}
      />
    </div>
  );
};

export default Home;
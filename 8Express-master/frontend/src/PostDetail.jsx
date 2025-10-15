// PostDetail.jsx - Fixed version
import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, MessageSquare, Eye, Share2, Bookmark,
  ThumbsUp, UserPlus, UserCheck, Send, MoreHorizontal, Flag
} from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { mockPosts } from './mockData';
import logo from './img/logo.png';
const PostDetail = ({ isLoggedIn, userInfo }) => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // ← FIX: Thêm useNavigate
  const post = location.state?.post || mockPosts.find(p => p.id === parseInt(postId));
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 120);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(
    Array.isArray(post?.comments) ? post.comments : [
    {
      id: 1,
      userName: 'Trần Thị Bình',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      content: 'Bài viết rất hay và ý nghĩa!',
      createdAt: '2 giờ trước',
      likes: 5
    },
    {
      id: 2,
      userName: 'Lê Văn Cường',
      userAvatar: 'https://i.pravatar.cc/150?img=11',
      content: 'Cảm ơn tác giả đã chia sẻ. Tôi đã học được nhiều điều mới.',
      createdAt: '5 giờ trước',
      likes: 3
    }
  ]);

  // Related posts
  const relatedPosts = [
    {
      id: 101,
      title: 'Tương lai của loài người... hay tương lai chúng ta?',
      author: 'Ken Tran',
      category: 'QUAN ĐIỂM - TRANH LUẬN',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300'
    },
    {
      id: 102,
      title: 'M-series #08: KHÁI QUÁT VỀ BỒI THƯỜNG THIỆT HẠI',
      author: 'Moot Court Club Luật ĐHQGHN',
      category: 'QUAN ĐIỂM - TRANH LUẬN',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300'
    },
    {
      id: 103,
      title: 'Về "nắm hay buông" và một mối quan hệ "cực kỳ tối tệ"',
      author: 'Nhật Bảo',
      category: 'QUAN ĐIỂM - TRANH LUẬN',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
    }
  ];

  const handleLike = () => {
    if (!isLoggedIn) {
      navigate('/login'); // ← FIX
      return;
    }
    setHasLiked(!hasLiked);
    setLikeCount(hasLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleFollow = () => {
    if (!isLoggedIn) {
      navigate('/login'); // ← FIX
      return;
    }
    setIsFollowing(!isFollowing);
  };

  const handleComment = () => {
    if (!isLoggedIn) {
      navigate('/login'); // ← FIX
      return;
    }
    if (!commentText.trim()) return;

    const newComment = {
      id: comments.length + 1,
      userName: userInfo?.name || 'User',
      userAvatar: userInfo?.avatar || 'https://i.pravatar.cc/150?img=1',
      content: commentText,
      createdAt: 'Vừa xong',
      likes: 0
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleViewDetail = (relatedPost) => {
    navigate(`/post/${relatedPost.id}`, { state: { post: relatedPost } });
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')} // ← FIX
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Quay lại</span>
            </button>

            <img 
                onClick={() => navigate('/')}
                className="h-20 w-auto cursor-pointer"
                src={logo}
                alt="8Express Logo"
              
              />

            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Category Tag */}
              <div className="px-8 pt-8">
                <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  {post.category || 'THINKING OUT LOUD'}
                </span>
              </div>

              {/* Title */}
              <div className="px-8 py-6">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>
              </div>

              {/* Author Info */}
              <div className="px-8 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorAvatar || 'https://i.pravatar.cc/150?img=1'}
                      alt={post.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{post.author}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{post.timeAgo || '17 giờ trước'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {post.views || 234}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={18} />
                        Đang theo dõi
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Theo dõi
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              {post.image && (
                <div className="w-full h-96 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="px-8 py-8">
                {post.excerpt && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded">
                    <p className="text-gray-700 italic font-medium">{post.excerpt}</p>
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.content || `Nội dung chi tiết của bài viết "${post.title}".\n\nĐây là phần nội dung chính của bài viết. Trong thực tế, nội dung này sẽ được lấy từ database và có thể bao gồm nhiều đoạn văn, hình ảnh, video và các định dạng khác.\n\nBài viết có thể sử dụng Markdown hoặc Rich Text Editor để tạo ra nội dung phong phú và đa dạng hơn.`}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 transition ${
                        hasLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={24} 
                        className={hasLiked ? 'fill-current' : ''} 
                      />
                      <span className="font-medium">{likeCount}</span>
                    </button>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageSquare size={24} />
                      <span className="font-medium">{comments.length}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye size={24} />
                      <span className="font-medium">{post.views || 234}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                      <Bookmark size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Follow Author Section */}
              <div className="px-8 py-8 border-t border-gray-200">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <img 
                      src={post.authorAvatar || 'https://i.pravatar.cc/150?img=1'}
                      alt={post.author}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{post.author}</p>
                      <p className="text-sm text-gray-600">156 người theo dõi • 24 bài viết</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-3 rounded-lg font-medium transition shadow-md ${
                      isFollowing
                        ? 'bg-white text-gray-700 hover:bg-gray-100'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi tác giả'}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="px-8 py-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Bình luận ({comments.length})
                </h3>

                {isLoggedIn ? (
                  <div className="mb-8">
                    <div className="flex gap-3">
                      <img 
                        src={userInfo?.avatar || 'https://i.pravatar.cc/150?img=1'}
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Hãy chia sẻ cảm nghĩ của bạn về bài viết..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleComment}
                            disabled={!commentText.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Send size={16} />
                            Gửi bình luận
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-600 mb-3">Đăng nhập để bình luận</p>
                    <button
                      onClick={() => navigate('/login')} // ← FIX
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img 
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">{comment.userName}</p>
                            <span className="text-xs text-gray-500">{comment.createdAt}</span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 ml-4">
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition">
                            <ThumbsUp size={14} />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-sm text-gray-500 hover:text-indigo-600 transition">
                            Trả lời
                          </button>
                          <button className="text-sm text-gray-500 hover:text-red-600 transition">
                            <Flag size={14} className="inline" /> Báo cáo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={post.authorAvatar || 'https://i.pravatar.cc/150?img=1'}
                    alt={post.author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-600">@{post.author?.toLowerCase().replace(/\s+/g, '_')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  156 người theo dõi • 24 bài viết
                </p>
                <button
                  onClick={handleFollow}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Bài viết nổi bật</h3>
                <div className="space-y-4">
                  {relatedPosts.map(related => (
                    <div 
                      key={related.id}
                      onClick={() => handleViewDetail(related)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <img 
                        src={related.image}
                        alt={related.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">{related.category}</p>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{related.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Chia sẻ bài viết</h3>
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    Facebook
                  </button>
                  <button className="flex-1 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-sm">
                    Twitter
                  </button>
                  <button className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm">
                    X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
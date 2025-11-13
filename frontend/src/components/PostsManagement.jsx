import { useState, useEffect } from 'react';
import { Search, Ban, Eye, X, CheckCircle, MessageSquare, Share } from 'lucide-react';
import axios from "axios";

const API_BASE = "http://localhost:5000";

const PostsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiPage, setAiPage] = useState(1);
  const aiPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/posts?page=${currentPage}&limit=${postsPerPage}`);
        if (res.data.success) {
          setPosts(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
      }
    };
    fetchPosts();
  }, [currentPage, postsPerPage]);

  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc muốn duyệt bài viết này?')) {
      try {
        const res = await axios.post(
          `${API_BASE}/admin/posts/${id}/status`,
          { status: "Approved" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.success) {
          setPosts(posts.map(post =>
            post.id === id
              ? { ...post, status: 'Approved' }
              : post
          ));
        }
      } catch (err) {
        console.error("Lỗi khi duyệt bài viết:", err);
      }
    }
  };

  const handleBan = async (id) => {
    if (window.confirm('Bạn có chắc muốn cấm bài viết này không?')) {
      try {
        const res = await axios.post(
          `${API_BASE}/admin/posts/${id}/status`,
          { status: "Banned" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        if (res.data.success) {
          setPosts(posts.map(post =>
            post.id === id
              ? { ...post, status: 'Banned' }
              : post
          ));
        }
      } catch (err) {
        console.error("Lỗi khi cấm bài viết:", err);
      }
    }
  };

  const handleViewDetail = async (postId) => {
    try {
      const res = await axios.get(`${API_BASE}/admin/posts/${postId}`);
      if (res.data.success) {
        setSelectedPost(res.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Lỗi khi xem chi tiết bài viết:", err);
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const filteredPosts = posts.filter((post) => {
    const matchesTitle = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = post.author?.toLowerCase().includes(authorSearch.toLowerCase());
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    return matchesTitle && matchesAuthor && matchesStatus;
  });

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tác giả..."
                value={authorSearch}
                onChange={(e) => {
                  setAuthorSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Chờ phê duyệt</option>
                <option value="Hidden">Đã ẩn</option>
                <option value="Banned">Bị cấm</option>
              </select>
              <button
                onClick={async () => {
                  if (window.confirm("Bạn có muốn AI tự động duyệt tất cả bài viết đang chờ duyệt không?")) {
                    try {
                      const pendingPosts = posts.filter(p => p.status === "Pending");
                      if (pendingPosts.length === 0) {
                        alert("Không có bài viết nào đang chờ phê duyệt.");
                        return;
                      }
                      const res = await axios.post(`${API_BASE}/admin/ai/review-posts`, {
                        posts: posts
                          .filter(p => p.status === "Pending")
                          .map(p => ({
                            id: p.id,
                            title: p.title,
                            body: p.body || "",
                          })),
                      }, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      });
                      if (res.data.success) {
                        const { approvedCount, bannedCount, bannedPosts } = res.data.summary;
                        setAiResult({
                          approvedCount,
                          bannedCount,
                          bannedPosts,
                          processed: posts
                            .filter(p => p.status === "Pending")
                            .map(p => {
                              const bp = bannedPosts.find(x => x.id === p.id);
                              return {
                                id: p.id,
                                title: p.title,
                                author: p.author,
                                status: bp ? "Banned" : "Approved",
                                keywords: bp ? bp.keywords : []
                              };
                            }),
                        });
                        setAiModalOpen(true);
                        setPosts(posts.map(p => {
                          if (p.status === "Pending") {
                            const bp = bannedPosts.find(x => x.id === p.id);
                            if (bp) return { ...p, status: "Banned" };
                            return { ...p, status: "Approved" };
                          }
                          return p;
                        }));
                      } else {
                        alert("AI duyệt bài viết thất bại.");
                      }
                    } catch (err) {
                      alert("AI duyệt bài viết thất bại!");
                      console.error(err);
                    }
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition"
              >
                Duyệt bài viết bằng AI
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {post.topic}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${post.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : post.status === 'Hidden'
                              ? 'bg-gray-200 text-gray-700'
                              : post.status === 'Banned'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {post.status === 'Approved'
                          ? 'Đã duyệt'
                          : post.status === 'Pending'
                            ? 'Chờ phê duyệt'
                            : post.status === 'Hidden'
                              ? 'Đã ẩn'
                              : post.status === 'Banned'
                                ? 'Bị cấm'
                                : post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        {post.reactions.map((r, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span>{r.icon}</span> {r.count}
                          </span>
                        ))}
                        <span className="flex items-center gap-1 ml-2">
                          <MessageSquare size={14} /> {post.commentCount}
                        </span>
                        <span className="flex items-center gap-1 ml-2">
                          <Share size={14} /> {post.shareCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(post.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {(post.status === 'Pending' || post.status === 'Banned') && (
                          <button
                            onClick={() => handleApprove(post.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                            title="Duyệt bài viết"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {post.status !== 'Banned' && (
                          <button
                            onClick={() => handleBan(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Cấm bài viết"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-gray-700">
            Trang <span className="font-medium">{currentPage}</span> /{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-blue-500'
                }`}
            >
              Trước
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === number
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 hover:bg-blue-500 text-gray-700'
                  }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${currentPage === totalPages || totalPages === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-50'
                }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết bài viết</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{selectedPost.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${selectedPost.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : selectedPost.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : selectedPost.status === 'Hidden'
                        ? 'bg-gray-200 text-gray-700'
                        : selectedPost.status === 'Banned'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {selectedPost.status === 'Approved'
                    ? 'Đã duyệt'
                    : selectedPost.status === 'Pending'
                      ? 'Chờ phê duyệt'
                      : selectedPost.status === 'Hidden'
                        ? 'Đã ẩn'
                        : selectedPost.status === 'Banned'
                          ? 'Bị cấm'
                          : selectedPost.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span>
                  <strong>{selectedPost.author}</strong>
                </span>
                {selectedPost.authorEmail && (
                  <>
                    <span>•</span>
                    <span className="text-gray-500">{selectedPost.authorEmail}</span>
                  </>
                )}
                <span>•</span>
                <span>{selectedPost.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {selectedPost.topic}
                </span>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                {selectedPost.body || selectedPost.content}
              </div>
              <div className="space-y-4 mb-6">
                {selectedPost.image && (
                  <div className="text-center">
                    <img
                      src={selectedPost.image}
                      alt="Ảnh bài viết"
                      className="max-h-96 mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                {selectedPost.video && (
                  <div className="text-center">
                    <video
                      controls
                      className="max-h-96 mx-auto rounded-lg shadow-md"
                    >
                      <source src={selectedPost.video} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                )}
                {selectedPost.audio && (
                  <div className="text-center">
                    <audio
                      controls
                      className="w-full"
                    >
                      <source src={selectedPost.audio} type="audio/mpeg" />
                      Trình duyệt của bạn không hỗ trợ audio.
                    </audio>
                  </div>
                )}
              </div>
              <div className="border-t pt-6 mb-6">
                <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                  {selectedPost.reactions.map((r, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm min-w-[90px]"
                    >
                      <div className="text-2xl">{r.icon}</div>
                      <div className="text-lg font-semibold text-gray-800">{r.count}</div>
                      <div className="text-xs text-gray-500 capitalize">{r.name}</div>
                    </div>
                  ))}
                  <div className="bg-blue-50 px-4 py-3 rounded-lg shadow-sm min-w-[90px]">
                    <MessageSquare className="mx-auto mb-1 text-blue-600" size={20} />
                    <div className="text-lg font-semibold text-blue-600">
                      {selectedPost.commentCount}
                    </div>
                    <div className="text-xs text-gray-500">Bình luận</div>
                  </div>
                  <div className="bg-purple-50 px-4 py-3 rounded-lg shadow-sm min-w-[90px]">
                    <Share className="mx-auto mb-1 text-purple-600" size={20} />
                    <div className="text-lg font-semibold text-purple-600">
                      {selectedPost.shareCount}
                    </div>
                    <div className="text-xs text-gray-500">Chia sẻ</div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Bình luận ({selectedPost.commentCount})
                </h4>
                {selectedPost.comments?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} level={0} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <AIDialog
        aiModalOpen={aiModalOpen}
        aiResult={aiResult}
        aiPage={aiPage}
        setAiPage={setAiPage}
        setAiModalOpen={setAiModalOpen}
        aiPerPage={aiPerPage}
      />
    </div>
  );
};

const CommentItem = ({ comment, level }) => (
  <div style={{ marginLeft: level * 32 }} className="flex gap-3 mb-4">
    <img
      src={comment.userAvatar || "/default-avatar.png"}
      alt={comment.userName}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-gray-800">{comment.userName}</span>
          <span className="text-xs text-gray-500">{comment.created_at}</span>
        </div>
        <p className="text-gray-700">{comment.body}</p>
      </div>
      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((child) => (
            <CommentItem key={child.id} comment={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  </div>
);

const AIDialog = ({
  aiModalOpen,
  aiResult,
  aiPage,
  setAiPage,
  setAiModalOpen,
  aiPerPage
}) => {
  if (!aiModalOpen || !aiResult) return null;
  const { approvedCount, bannedCount, processed } = aiResult;
  const total = processed.length;
  const startIdx = (aiPage - 1) * aiPerPage;
  const endIdx = startIdx + aiPerPage;
  const pageData = processed.slice(startIdx, endIdx);
  const totalPages = Math.ceil(total / aiPerPage);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Kết quả duyệt bài bằng AI</h2>
          <button
            onClick={() => setAiModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-green-700">{approvedCount}</div>
              <div className="text-sm text-green-800">Bài hợp lệ</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-red-700">{bannedCount}</div>
              <div className="text-sm text-red-800">Bài vi phạm</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-blue-700">{total}</div>
              <div className="text-sm text-blue-800">Tổng số bài xử lý</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Tiêu đề</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Người đăng</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Từ khoá vi phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3">{item.title}</td>
                    <td className="p-3">{item.author}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.status === "Approved" ? "Đã duyệt" : "Bị cấm"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.keywords?.length > 0 ? item.keywords.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={aiPage === 1}
              onClick={() => setAiPage(aiPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setAiPage(i + 1)}
                className={`px-3 py-1 border rounded ${aiPage === i + 1 ? "bg-indigo-600 text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={aiPage === totalPages}
              onClick={() => setAiPage(aiPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsManagement;
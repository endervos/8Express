import React, { useState } from 'react';
import { Search, Edit, Trash2, Eye, X, CheckCircle, MessageSquare, ThumbsUp } from 'lucide-react';
import { mockPosts } from '../User/MockData';

const PostsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [posts, setPosts] = useState(mockPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // State cho tính năng chỉnh sửa
  const [editingPost, setEditingPost] = useState(null); 
  
  // LOGIC PHÂN TRANG: Set tối đa 7 bài viết mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(7); 

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
      
      // Tính toán lại trang hiện tại sau khi xóa
      const newTotalPages = Math.ceil(updatedPosts.length / postsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
      }
    }
  };

  const handleApprove = (id) => {
    if (window.confirm('Bạn có chắc muốn duyệt bài viết này?')) {
      setPosts(posts.map(post => 
        post.id === id ? { 
          ...post, 
          status: 'published',
          publishedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        } : post
      ));
    }
  };
  
  // Xử lý mở form chỉnh sửa
  const handleEdit = (post) => {
    setEditingPost(post);
  };
  
  // Xử lý lưu thay đổi
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setPosts(posts.map(post => 
      post.id === editingPost.id ? { 
        ...post, 
        title: editingPost.title,
        content: editingPost.content,
      } : post
    ));
    setEditingPost(null); // Đóng modal chỉnh sửa
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      setPosts(posts.map(post => 
        post.id === postId ? {
          ...post,
          comments: post.comments.filter(c => c.id !== commentId)
        } : post
      ));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.filter(c => c.id !== commentId)
        });
      }
    }
  };

  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // LOGIC PHÂN TRANG (PAGINATION)
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  // KẾT THÚC LOGIC PHÂN TRANG

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          {/* Cập nhật Responsive cho khu vực Tìm kiếm và Lọc */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              
              <select 
                value={filterStatus}
                onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi lọc
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã đăng</option>
                <option value="draft">Chờ phê duyệt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng với overflow-x-auto để responsive trên màn hình nhỏ */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài viết</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tác giả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ưu tiên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tương tác</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{post.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{post.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status === 'published' ? 'Đã đăng' : 'Chờ phê duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : post.priority === 'medium' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {post.priority === 'high' ? 'Cao' : post.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </td>
                      
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          {post.comments.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetail(post)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {post.status === 'draft' && (
                          <button 
                            onClick={() => handleApprove(post.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                            title="Duyệt bài"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(post)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
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

        {/* PHẦN PHÂN TRANG (PAGINATION) */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-gray-700">
            {/* FIX LỖI DÍNH CHỮ: Thêm khoảng trắng vào đây */}
            Hiển thị <span className="font-medium">{indexOfFirstPost + 1} </span>
            đến <span className="font-medium">{Math.min(indexOfLastPost, totalPosts)} </span> 
            trong tổng số <span className="font-medium">{totalPosts}</span> bài viết
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-gray-300 rounded-lg text-sm transition ${
                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-blue-500'
              }`}
            >
              Trước
            </button>
            
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-lg text-sm transition font-medium ${
                  currentPage === number 
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
              className={`px-3 py-1 border border-gray-300 rounded-lg text-sm transition ${
                currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Post Detail Modal (Giữ nguyên) */}
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
              {/* Post Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>Tác giả: <strong>{selectedPost.author}</strong></span>
                  <span>•</span>
                  <span>{selectedPost.createdAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {selectedPost.views} lượt xem
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPost.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedPost.status === 'published' ? 'Đã đăng' : 'Chờ phê duyệt'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPost.priority === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : selectedPost.priority === 'medium' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    Ưu tiên: {selectedPost.priority === 'high' ? 'Cao' : selectedPost.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {selectedPost.category}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Tóm tắt:</h4>
                <p className="text-gray-700">{selectedPost.excerpt}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Nội dung:</h4>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedPost.tags||[]).map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Eye className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="text-2xl font-bold text-blue-600">{selectedPost.views}</p>
                  <p className="text-sm text-gray-600">Lượt xem</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <ThumbsUp className="mx-auto mb-2 text-red-600" size={24} />
                  <p className="text-2xl font-bold text-red-600">{selectedPost.likes}</p>
                  <p className="text-sm text-gray-600">Lượt thích</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <MessageSquare className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-2xl font-bold text-green-600">{(selectedPost.comments||[]).length}</p>
                  <p className="text-sm text-gray-600">Bình luận</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Bình luận ({selectedPost.comments.length})
                </h4>
                {selectedPost.comments.length > 0 ? (
                  <div className="space-y-4">
                    {(selectedPost.comments||[]).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <img 
                            src={comment.userAvatar} 
                            alt={comment.userName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{comment.userName}</p>
                                <p className="text-xs text-gray-500">{comment.createdAt}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                title="Xóa bình luận"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-gray-700 mb-2">{comment.content}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ThumbsUp size={14} />
                              <span>{comment.likes} lượt thích</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 border-t pt-6">
                {selectedPost.status === 'draft' && (
                  <button 
                    onClick={() => {
                      handleApprove(selectedPost.id);
                      setShowModal(false);
                    }}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Duyệt bài viết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Post Modal (Đã thêm) */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài viết</h3>
              <button 
                onClick={() => setEditingPost(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingPost.title}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">Nội dung</label>
                <textarea
                  id="content"
                  name="content"
                  rows="8"
                  value={editingPost.content}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsView;
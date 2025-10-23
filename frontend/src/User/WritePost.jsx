import React, { useState } from 'react';
import { ArrowLeft, Image, Eye, Save, Send, Tag, BookOpen } from 'lucide-react';
import { mockCategories } from './MockData';
import { useNavigate } from 'react-router-dom';

const WritePost = ({ isLoggedIn, userInfo }) => {
  const navigate = useNavigate();
  
  const [postData, setPostData] = useState({
    title: '',
    category: '',
    content: '',
    excerpt: '',
    tags: '',
    coverImage: null
  });

  const [activeTab, setActiveTab] = useState('write');

  // Nếu chưa đăng nhập, chuyển về login
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostData(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    console.log('Lưu nháp:', postData);
    alert('Đã lưu bài viết vào nháp!');
  };

  const handlePublish = (e) => {
    e.preventDefault();
    
    if (!postData.title || !postData.category || !postData.content) {
      alert('Vui lòng điền đầy đủ thông tin bài viết!');
      return;
    }

    console.log('Đăng bài:', postData);
    alert('Bài viết của bạn đã được gửi và đang chờ phê duyệt!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Quay lại</span>
            </button>

            <h1 className="text-2xl font-bold text-gray-800">Viết bài mới</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Save size={18} />
                Lưu nháp
              </button>
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Send size={18} />
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'write'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={18} className="inline mr-2 -mt-0.5" />
              Viết bài
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'preview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye size={18} className="inline mr-2 -mt-0.5" />
              Xem trước
            </button>
          </div>

          {/* Write Tab */}
          {activeTab === 'write' && (
            <form className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={postData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={postData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Chọn chủ đề</option>
                  {mockCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh bìa (Tùy chọn)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Image size={18} className="text-gray-600" />
                    <span className="text-gray-700">Chọn ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {postData.coverImage && (
                    <img 
                      src={postData.coverImage} 
                      alt="Preview" 
                      className="h-20 w-auto rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt ngắn
                </label>
                <textarea
                  name="excerpt"
                  value={postData.excerpt}
                  onChange={handleChange}
                  placeholder="Viết vài dòng giới thiệu ngắn gọn..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài viết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={postData.content}
                  onChange={handleChange}
                  placeholder="Viết nội dung bài viết của bạn ở đây..."
                  rows="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1 -mt-0.5" />
                  Tags (Ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={postData.tags}
                  onChange={handleChange}
                  placeholder="VD: react, javascript, web development"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Bài viết của bạn sẽ được kiểm duyệt trước khi xuất bản.
                </p>
              </div>
            </form>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="p-8">
              {postData.title || postData.content ? (
                <article className="prose max-w-none">
                  {postData.coverImage && (
                    <img 
                      src={postData.coverImage} 
                      alt="Cover" 
                      className="w-full h-64 object-cover rounded-xl mb-6"
                    />
                  )}

                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {postData.title || 'Tiêu đề bài viết'}
                  </h1>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${userInfo?.email}`}
                        alt={userInfo?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{userInfo?.name}</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    {postData.category && (
                      <>
                        <span>•</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {postData.category}
                        </span>
                      </>
                    )}
                  </div>

                  {postData.excerpt && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded">
                      <p className="text-gray-700 italic">{postData.excerpt}</p>
                    </div>
                  )}

                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                    {postData.content || 'Nội dung bài viết sẽ hiển thị ở đây...'}
                  </div>

                  {postData.tags && (
                    <div className="flex items-center gap-2 pt-6 border-t">
                      <Tag size={16} className="text-gray-500" />
                      <div className="flex flex-wrap gap-2">
                        {postData.tags.split(',').map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Chưa có nội dung để xem trước. Hãy bắt đầu viết bài!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritePost;
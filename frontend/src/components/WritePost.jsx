import { useState, useEffect } from 'react';
import { ArrowLeft, Image, Eye, Send, BookOpen, Video, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dialog from "./Dialog";

const API_BASE = `http://${window.location.hostname}:5000`;

const WritePost = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [postData, setPostData] = useState({
    title: '',
    topic: '',
    body: '',
    image: null,
    audio: null,
    video: null,
  });
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const openDialog = (title, message, onConfirm = null) => {
    setDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };
  const closeDialog = () => {
    setDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_BASE}/topics`);
        const data = await res.json();
        if (data.success) {
          setTopics(data.data);
        } else {
          console.warn('Không lấy được danh sách topic:', data.message);
        }
      } catch (err) {
        console.error('Lỗi tải topic:', err);
      }
    };
    fetchTopics();
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_MB = 20;
      if (file.size > MAX_MB * 1024 * 1024) {
        openDialog("Cảnh báo", `File quá lớn! Giới hạn tối đa là ${MAX_MB}MB.`);
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.topic || !postData.body) {
      openDialog("Lỗi", "Vui lòng điền đầy đủ thông tin bài viết!");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/posts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({
          title: postData.title,
          topic: postData.topic,
          body: postData.body,
          image: postData.image,
          video: postData.video,
          audio: postData.audio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        openDialog("Thành công", "Viết bài thành công!", () => navigate("/"));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Lỗi đăng bài:', err);
      openDialog("Lỗi", "Không thể gửi bài viết.");
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {
        dialog.open && (
          <Dialog
            title={dialog.title}
            message={dialog.message}
            onClose={closeDialog}
            onConfirm={dialog.onConfirm}
          />
        )
      }
      <div className="min-h-screen bg-gray-50">
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
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('write')}
                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'write'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <BookOpen size={18} className="inline mr-2 -mt-0.5" />
                Viết bài
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'preview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Eye size={18} className="inline mr-2 -mt-0.5" />
                Xem trước
              </button>
            </div>
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
                    name="topic"
                    value={postData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh (Tùy chọn)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Image size={18} className="text-gray-600" />
                      <span className="text-gray-700">Chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                      />
                    </label>
                    {postData.image && (
                      <img
                        src={postData.image}
                        alt="Ảnh"
                        className="mt-2 h-20 w-auto rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video (Tùy chọn)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Video size={18} className="text-gray-600" />
                      <span className="text-gray-700">Chọn video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="hidden"
                      />
                    </label>
                    {postData.video && (
                      <video
                        src={postData.video}
                        controls
                        className="mt-2 h-20 rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âm thanh (Tùy chọn)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Music size={18} className="text-gray-600" />
                      <span className="text-gray-700">Chọn file audio</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, 'audio')}
                        className="hidden"
                      />
                    </label>
                    {postData.audio && (
                      <audio
                        src={postData.audio}
                        controls
                        className="mt-2 w-full rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={postData.body}
                    onChange={handleChange}
                    placeholder="Viết nội dung bài viết của bạn ở đây..."
                    rows="15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm"
                    required
                  />
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Bài viết của bạn sẽ được kiểm duyệt trước khi xuất bản.
                  </p>
                </div>
              </form>
            )}
            {activeTab === 'preview' && (
              <div className="p-8">
                {postData.title || postData.body ? (
                  <article className="prose max-w-none">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      {postData.title || 'Tiêu đề bài viết'}
                    </h1>
                    {postData.topic && (
                      <p className="text-indigo-600 font-medium mb-2">
                        Chủ đề: {postData.topic}
                      </p>
                    )}
                    {postData.image && (
                      <div className="my-4 flex justify-center">
                        <img
                          src={postData.image}
                          alt="Ảnh xem trước"
                          className="rounded-lg shadow-md max-h-96 object-contain"
                        />
                      </div>
                    )}
                    {postData.video && (
                      <div className="my-4 flex justify-center">
                        <video
                          src={postData.video}
                          controls
                          className="rounded-lg shadow-md max-h-96 w-full md:w-3/4"
                        />
                      </div>
                    )}
                    {postData.audio && (
                      <div className="my-4 flex justify-center">
                        <audio
                          src={postData.audio}
                          controls
                          className="w-full md:w-3/4 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-6">
                      {postData.body || 'Nội dung bài viết sẽ hiển thị ở đây...'}
                    </div>
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
    </>
  );
};

export default WritePost;
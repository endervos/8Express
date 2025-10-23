import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

// Icon Google (thêm mới)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const MOCK_ACCOUNTS = [
  { email: 'admin@8express.com', password: 'admin123', role: 'admin', name: 'Admin' },
  { email: 'user@8express.com', password: 'user123', role: 'user', name: 'Nguyễn Văn A' },
];

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const account = MOCK_ACCOUNTS.find(
      acc => acc.email === formData.email && acc.password === formData.password
    );

    if (account) {
      onLogin(account);
      navigate('/'); 
    } else {
      setError('Email hoặc mật khẩu không đúng!');
    }
  };

  // HÀM MÔ PHỎNG ĐĂNG NHẬP BẰNG GOOGLE (thêm mới)
  const handleGoogleLogin = () => {
    // Trong ứng dụng thực tế, đây là nơi bạn sẽ gọi API
    // của Google OAuth2 hoặc một thư viện như 'react-google-login'.
    // Sau khi xác thực thành công, Google sẽ trả về thông tin người dùng.
    
    // Ở đây, chúng ta sẽ mô phỏng việc nhận được thông tin user.
    console.log("Đã kích hoạt đăng nhập bằng Google (mô phỏng)");
    const googleUser = {
      email: 'google.user@example.com',
      role: 'user',
      name: 'Người Dùng Google',
    };
    
    onLogin(googleUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng bạn</h1>
          <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <button 
              type="button"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            Đăng nhập
          </button>
        </form>

        {/* --- PHẦN THÊM MỚI BẮT ĐẦU TỪ ĐÂY --- */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">HOẶC</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            <GoogleIcon />
            Đăng nhập với Google
          </button>
        </div>
        {/* --- KẾT THÚC PHẦN THÊM MỚI --- */}

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition"
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Demo accounts info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Tài khoản demo:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>👑 <strong>Admin:</strong> admin@8express.com / admin123</p>
            <p>👤 <strong>User:</strong> user@8express.com / user123</p>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            * Sau khi đăng nhập, bạn sẽ về trang chủ. Admin sẽ thấy nút "Admin Dashboard".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
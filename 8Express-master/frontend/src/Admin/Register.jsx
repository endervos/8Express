import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';

// Dữ liệu giả định mở rộng cho Tỉnh/Thành phố và Quận/Huyện
const PROVINCES_DATA = [
  { value: '', label: 'Chọn Tỉnh/Thành phố', cities: [] },
  { value: 'hanoi', label: 'Hà Nội', cities: ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Cầu Giấy', 'Quận Hoàng Mai'] },
  { value: 'hcm', label: 'Hồ Chí Minh', cities: ['Quận 1', 'Quận 3', 'Quận Tân Bình', 'Quận Phú Nhuận', 'Thành phố Thủ Đức'] },
  { value: 'danang', label: 'Đà Nẵng', cities: ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn'] },
  { value: 'hue', label: 'Thừa Thiên Huế', cities: ['Thành phố Huế', 'Huyện Phú Lộc', 'Huyện Phong Điền'] },
  { value: 'cantho', label: 'Cần Thơ', cities: ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Huyện Phong Điền'] },
];

const Register = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    verificationCode: '',
    birthYear: '', 
    birthMonth: '',
    birthDay: '',
    gender: '',
    province: '',
    city: ''
  });
  const [codeSent, setCodeSent] = useState(false);

  // LOGIC NGÀY SINH
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const daysInMonth = useMemo(() => {
    if (!formData.birthYear || !formData.birthMonth) return 31;
    return new Date(formData.birthYear, formData.birthMonth, 0).getDate();
  }, [formData.birthYear, formData.birthMonth]);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // LOGIC XỬ LÝ ĐĂNG KÝ
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Giả lập logic kiểm tra và gọi API đăng ký
    // Nếu thành công:
    const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
    console.log('Register data:', { ...formData, dateOfBirth });

    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    // CHỨC NĂNG CẬP NHẬT: out ra phần đăng nhập
    onNavigate('login'); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProvinceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      city: '' // Reset Quận/Huyện khi Tỉnh/Thành phố thay đổi
    }));
  };

  const handleSendCode = () => {
    if (formData.email) {
      console.log('Sending verification code to:', formData.email);
      setCodeSent(true);
      setTimeout(() => setCodeSent(false), 60000);
    } else {
      alert('Vui lòng nhập email trước');
    }
  };

  const currentCities = PROVINCES_DATA.find(p => p.value === formData.province)?.cities || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Tham gia cộng đồng 8Express ngay hôm nay!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          {/* Email Field */}
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>
          
          {/* NGÀY SINH BẰNG 3 SELECT RIÊNG */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <div className="flex gap-2">
              {/* Năm */}
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="" disabled>Năm</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              
              {/* Tháng */}
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                disabled={!formData.birthYear}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                required
              >
                <option value="" disabled>Tháng</option>
                {months.map(m => (
                  <option key={m} value={m < 10 ? `0${m}` : m}>{m}</option>
                ))}
              </select>
              
              {/* Ngày */}
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                disabled={!formData.birthYear || !formData.birthMonth}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                required
              >
                <option value="" disabled>Ngày</option>
                {days.map(d => (
                  <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Giới tính Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="" disabled>Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          
          {/* Địa chỉ (Tỉnh/Thành phố & Quận/Huyện) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tỉnh/Thành phố */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleProvinceChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none"
                  required
                >
                  {PROVINCES_DATA.map(p => (
                    <option key={p.value} value={p.value} disabled={p.value === ''}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quận/Huyện */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.province}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none"
                required
              >
                <option value="" disabled>Chọn Quận/Huyện</option>
                {currentCities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Field */}
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
                // Xóa con mắt cố định, chỉ còn icon Lock và icon chuyển đổi
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {/* Chỉ dùng Eye/EyeOff để chuyển đổi */}
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Verification Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã xác thực</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Nhập mã từ email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeSent}
                className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition ${
                  codeSent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {codeSent ? 'Đã gửi' : 'Gửi mã'}
              </button>
            </div>
            {codeSent && (
              <p className="text-xs text-green-600 mt-1">Mã xác thực đã được gửi đến email của bạn</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition shadow-lg hover:shadow-xl"
          >
            Đăng ký
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
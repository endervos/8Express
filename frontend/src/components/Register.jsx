import { useState, useMemo } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const API_BASE = "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const daysInMonth = useMemo(() => {
    if (!formData.birthYear || !formData.birthMonth) return 31;
    return new Date(formData.birthYear, formData.birthMonth, 0).getDate();
  }, [formData.birthYear, formData.birthMonth]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2)
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự.";

    if (!/^[^@]+@[^@]+\.[a-z]{2,}(\.[a-z]{2,})?$/i.test(formData.email))
      newErrors.email = "Định dạng email không hợp lệ.";

    if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";

    if (formData.password.length < 8)
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";

    if (formData.birthYear && formData.birthMonth && formData.birthDay) {
      const dob = dayjs(`${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`);
      const age = dayjs().diff(dob, "year");
      if (age < 16) newErrors.birthDate = "Người dùng phải đủ 16 tuổi trở lên.";
    } else {
      newErrors.birthDate = "Vui lòng chọn đầy đủ ngày sinh.";
    }

    if (!formData.gender) newErrors.gender = "Vui lòng chọn giới tính.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Mã xác thực đã được gửi tới email của bạn!");
        navigate("/verify-email", { state: { formData } });
      } else {
        alert(`${data.message || "Không thể gửi mã xác thực."}`);
      }
    } catch (err) {
      console.error("Lỗi gửi OTP:", err);
      alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Tham gia cộng đồng 8Express ngay hôm nay!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ và tên */}
          <InputField
            icon={<User size={20} />}
            name="fullName"
            label="Họ và tên"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

          {/* Email */}
          <InputField
            icon={<Mail size={20} />}
            name="email"
            label="Email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          {/* Số điện thoại */}
          <InputField
            icon={<Phone size={20} />}
            name="phone"
            label="Số điện thoại"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <div className="flex gap-2">
              <SelectField name="birthYear" value={formData.birthYear} onChange={handleChange} options={years} label="Năm" />
              <SelectField name="birthMonth" value={formData.birthMonth} onChange={handleChange} options={months} label="Tháng" />
              <SelectField name="birthDay" value={formData.birthDay} onChange={handleChange} options={days} label="Ngày" />
            </div>
            {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>}
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium transition shadow-lg ${
              isLoading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isLoading ? "Đang gửi mã xác thực..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, name, label, value, onChange, placeholder, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectField = ({ name, value, onChange, options, label }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
  >
    <option value="">{label}</option>
    {options.map((opt) => (
      <option key={opt} value={opt < 10 ? `0${opt}` : opt}>
        {opt}
      </option>
    ))}
  </select>
);

export default Register;
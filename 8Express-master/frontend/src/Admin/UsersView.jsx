import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Trash2, UserX, UserCheck, Mail, Lock, User, X, MapPin } from 'lucide-react';

// Dữ liệu giả định mở rộng cho Tỉnh/Thành phố và Quận/Huyện (Giống trong Register.jsx)
const PROVINCES_DATA = [
    { value: '', label: 'Chọn Tỉnh/Thành phố', cities: [] },
    { value: 'hanoi', label: 'Hà Nội', cities: ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Cầu Giấy', 'Quận Hoàng Mai'] },
    { value: 'hcm', label: 'Hồ Chí Minh', cities: ['Quận 1', 'Quận 3', 'Quận Tân Bình', 'Quận Phú Nhuận', 'Thành phố Thủ Đức'] },
    { value: 'danang', label: 'Đà Nẵng', cities: ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn'] },
    { value: 'hue', label: 'Thừa Thiên Huế', cities: ['Thành phố Huế', 'Huyện Phú Lộc', 'Huyện Phong Điền'] },
    { value: 'cantho', label: 'Cần Thơ', cities: ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Huyện Phong Điền'] },
];

// --- Component Modal để THÊM người dùng mới ---
const AddUserModal = ({ isOpen, onClose, onAddUser, existingEmails }) => {
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user', 
    // TRƯỜNG MỚI
    birthYear: '', 
    birthMonth: '',
    birthDay: '',
    gender: '',
    province: '',
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
    
  // LOGIC NGÀY SINH (Copy từ Register.jsx)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const daysInMonth = useMemo(() => {
    if (!newUser.birthYear || !newUser.birthMonth) return 31;
    return new Date(newUser.birthYear, newUser.birthMonth, 0).getDate();
  }, [newUser.birthYear, newUser.birthMonth]);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
  const currentCities = PROVINCES_DATA.find(p => p.value === newUser.province)?.cities || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      if (existingEmails.includes(value.toLowerCase())) {
        setEmailError('Email này đã tồn tại trong hệ thống.');
      } else {
        setEmailError('');
      }
    }
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
    
  const handleProvinceChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ 
      ...prev, 
      [name]: value,
      city: '' // Reset City khi Province thay đổi
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailError) {
      alert('Vui lòng sửa lỗi trước khi thêm.');
      return;
    }
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.birthYear || !newUser.gender || !newUser.province || !newUser.city) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    onAddUser(newUser);
    setNewUser({ name: '', email: '', password: '', role: 'user', birthYear: '', birthMonth: '', birthDay: '', gender: '', province: '', city: '' });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Thêm người dùng mới vào hệ thống.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* HỌ TÊN, EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" name="name" value={newUser.name} onChange={handleChange} placeholder="Nguyễn Văn A" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" name="email" value={newUser.email} onChange={handleChange} placeholder="email@example.com" required className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}/></div>
            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          </div>
          
          {/* MẬT KHẨU (Sửa lỗi 2 con mắt) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={newUser.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    required 
                    // Xóa con mắt cố định, chỉ còn icon Lock và icon chuyển đổi
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          {/* NGÀY SINH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <div className="flex gap-2">
              <select name="birthYear" value={newUser.birthYear} onChange={handleChange} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required><option value="" disabled>Năm</option>{years.map(y => (<option key={y} value={y}>{y}</option>))}</select>
              <select name="birthMonth" value={newUser.birthMonth} onChange={handleChange} disabled={!newUser.birthYear} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50" required><option value="" disabled>Tháng</option>{months.map(m => (<option key={m} value={m < 10 ? `0${m}` : m}>{m}</option>))}</select>
              <select name="birthDay" value={newUser.birthDay} onChange={handleChange} disabled={!newUser.birthYear || !newUser.birthMonth} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50" required><option value="" disabled>Ngày</option>{days.map(d => (<option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>))}</select>
            </div>
          </div>
            
          {/* GIỚI TÍNH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <select name="gender" value={newUser.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              <option value="" disabled>Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
            
          {/* ĐỊA CHỈ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select name="province" value={newUser.province} onChange={handleProvinceChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none" required>
                  {PROVINCES_DATA.map(p => (<option key={p.value} value={p.value} disabled={p.value === ''}>{p.label}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
              <select name="city" value={newUser.city} onChange={handleChange} disabled={!newUser.province} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none" required>
                <option value="" disabled>Chọn Quận/Huyện</option>
                {currentCities.map((city, index) => (<option key={index} value={city}>{city}</option>))}
              </select>
            </div>
          </div>

          {/* VAI TRÒ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select name="role" value={newUser.role} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"><option value="user">Người dùng</option><option value="admin">Quản trị viên</option></select>
          </div>

          <button type="submit" disabled={!!emailError} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Thêm người dùng</button>
        </form>
      </div>
    </div>
  );
};

// --- Component Modal để XEM CHI TIẾT người dùng ---
const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const getProvinceLabel = (value) => PROVINCES_DATA.find(p => p.value === value)?.label || 'N/A';
  // Đảm bảo user có các trường ngày sinh mới trước khi format
  const fullDateOfBirth = user.birthYear ? `${user.birthDay}/${user.birthMonth}/${user.birthYear}` : 'N/A';
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin người dùng</h1>
            </div>
            <div className="space-y-3 text-gray-700">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Họ tên:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                
                <hr className="my-2"/>
                
                {/* HIỂN THỊ TRƯỜNG MỚI */}
                <p><strong>Ngày sinh:</strong> {fullDateOfBirth}</p>
                <p><strong>Giới tính:</strong> {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender === 'other' ? 'Khác' : 'N/A'}</p>
                <p><strong>Tỉnh/Thành phố:</strong> {getProvinceLabel(user.province)}</p>
                <p><strong>Quận/Huyện:</strong> {user.city || 'N/A'}</p>
                
                <hr className="my-2"/>
                
                <p><strong>Vai trò:</strong> <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></p>
                <p><strong>Trạng thái:</strong> <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}</span></p>
            </div>
        </div>
    </div>
  )
}

// --- Component chính để hiển thị danh sách người dùng ---
const UsersView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // CẬP NHẬT TRƯỜNG MỚI VÀO DỮ LIỆU MẪU
  const [users, setUsers] = useState([
    // Thêm các trường dữ liệu mới để hiển thị trong modal
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', status: 'active', role: 'user', birthYear: '1990', birthMonth: '05', birthDay: '15', gender: 'male', province: 'hanoi', city: 'Quận Cầu Giấy' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', status: 'active', role: 'admin', birthYear: '1995', birthMonth: '11', birthDay: '22', gender: 'female', province: 'hcm', city: 'Quận 1' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', status: 'inactive', role: 'user', birthYear: '2000', birthMonth: '01', birthDay: '01', gender: 'male', province: 'danang', city: 'Quận Sơn Trà' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', status: 'active', role: 'user', birthYear: '1985', birthMonth: '07', birthDay: '10', gender: 'female', province: 'hanoi', city: 'Quận Hoàn Kiếm' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', status: 'active', role: 'user', birthYear: '1998', birthMonth: '12', birthDay: '31', gender: 'male', province: 'hue', city: 'Thành phố Huế' },
    { id: 6, name: 'Vũ Thị F', email: 'vuthif@email.com', status: 'inactive', role: 'user', birthYear: '1992', birthMonth: '03', birthDay: '08', gender: 'female', province: 'cantho', city: 'Quận Ninh Kiều' },
    { id: 7, name: 'Đặng Văn G', email: 'dangvang@email.com', status: 'active', role: 'user', birthYear: '2001', birthMonth: '06', birthDay: '18', gender: 'male', province: 'hcm', city: 'Thành phố Thủ Đức' },
    { id: 8, name: 'Bùi Thị H', email: 'buithih@email.com', status: 'active', role: 'admin', birthYear: '1980', birthMonth: '09', birthDay: '25', gender: 'female', province: 'danang', city: 'Quận Thanh Khê' },
  ]);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const existingEmails = useMemo(() => users.map(u => u.email.toLowerCase()), [users]);

  const filteredUsers = useMemo(() => users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [users, searchTerm]);

  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleAddUser = (newUser) => {
    // Kiểm tra email trùng lặp một lần nữa trước khi thêm
    if (existingEmails.includes(newUser.email.toLowerCase())) {
        alert('Lỗi: Email này đã tồn tại!');
        return;
    }
    const userToAdd = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...newUser,
      status: 'active',
    };
    // Đảm bảo các trường birthMonth và birthDay có định dạng 2 chữ số (nếu có giá trị)
    userToAdd.birthMonth = userToAdd.birthMonth ? (userToAdd.birthMonth < 10 ? `0${userToAdd.birthMonth}` : userToAdd.birthMonth) : '';
    userToAdd.birthDay = userToAdd.birthDay ? (userToAdd.birthDay < 10 ? `0${userToAdd.birthDay}` : userToAdd.birthDay) : '';
      
    setUsers(prevUsers => [userToAdd, ...prevUsers]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      setUsers(users.filter(user => user.id !== id));
      if (currentUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleToggleStatus = (id) => setUsers(users.map(user => user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user));
  
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  }

  return (
    <>
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAddUser={handleAddUser} existingEmails={existingEmails} />
      <ViewUserModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} user={selectedUser} />

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Tìm kiếm người dùng..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/></div>
            <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">+ Thêm người dùng</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button onClick={() => handleViewUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Xem chi tiết"><Eye size={16} /></button>
                        <button onClick={() => handleToggleStatus(user.id)} className={`p-2 rounded transition ${user.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>{user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}</button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">Hiển thị <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> trên <span className="font-medium">{filteredUsers.length}</span> người dùng</div>
            {totalPages > 1 && (
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">Trước</button>
                    {Array.from({ length: totalPages }, (_, i) => (<button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded-lg text-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>))}
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">Sau</button>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default UsersView;
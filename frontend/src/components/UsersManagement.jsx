import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  UserX,
  UserCheck
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thông tin người dùng
          </h1>
        </div>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Họ và tên:</strong> {user.full_name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone || "—"}
          </p>
          <p>
            <strong>Giới tính:</strong> {user.gender}
          </p>
          <p>
            <strong>Ngày sinh:</strong> {user.date_of_birth}
          </p>
          <hr className="my-2" />
          <p>
            <strong>Vai trò:</strong>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-700"
                }`}
            >
              {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
                }`}
            >
              {user.status === "active" ? "Hoạt động" : "Vô hiệu hóa"}
            </span>
          </p>
          <hr className="my-2" />
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {user.created_at
              ? new Date(user.created_at).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false
              })
              : "Chưa có"}
          </p>
          <p>
            <strong>Ngày chỉnh sửa:</strong>{" "}
            {user.updated_at
              ? new Date(user.updated_at).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false
              })
              : "Chưa chỉnh sửa"}
          </p>
        </div>
      </div>
    </div>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: usersPerPage,
          name: nameSearch,
          email: emailSearch,
        });
        const res = await axios.get(`${API_BASE}/admin/users?${params.toString()}`);
        if (res.data.success) {
          setUsers(res.data.data.users);
          setTotalPages(res.data.data.totalPages);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách người dùng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, nameSearch, emailSearch]);

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user || user.role === "admin") return;
      const res = await axios.post(`${API_BASE}/admin/users/${id}/ban`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, status: res.data.is_banned ? "inactive" : "active" }
              : u
          )
        );
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      alert("Không thể thay đổi trạng thái người dùng.");
    }
  };

  const handleViewUser = async (user) => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/users/${user.id}?role=${user.role}`
      );
      if (res.data.success) {
        setSelectedUser(res.data.data);
        setViewModalOpen(true);
      }
    } catch (err) {
      console.error("Lỗi tải thông tin chi tiết người dùng:", err);
    }
  };

  return (
    <>
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        user={selectedUser}
      />

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên..."
                  value={nameSearch}
                  onChange={(e) => {
                    setNameSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo email..."
                  value={emailSearch}
                  onChange={(e) => {
                    setEmailSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">
              Đang tải dữ liệu...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.role_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {user.role === "admin"
                          ? "Quản trị viên"
                          : "Người dùng"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {user.status === "active"
                          ? "Hoạt động"
                          : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {user.role === "user" && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded transition ${user.status === "active"
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                              }`}
                            title={
                              user.status === "active"
                                ? "Vô hiệu hóa"
                                : "Kích hoạt"
                            }
                          >
                            {user.status === "active" ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {currentPage}/{totalPages}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm ${currentPage === i + 1
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersManagement;
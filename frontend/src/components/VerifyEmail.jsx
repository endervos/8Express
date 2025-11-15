import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Dialog from "./Dialog";

const API_BASE = `http://${window.location.hostname}:5000`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData;
  const email = formData?.email;
  const [code, setCode] = useState("");
  const [message] = useState("");
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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      openDialog("Lỗi", "Không có email để xác thực!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        openDialog("Đang tạo tài khoản", "Xác thực thành công! Hệ thống đang tạo tài khoản...");
        const registerRes = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const registerData = await registerRes.json();
        if (registerData.success) {
          openDialog("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.", () => {
            navigate("/login");
          });
        } else {
          openDialog("Lỗi", registerData.message);
        }
      } else {
        openDialog("Lỗi", data.message);
      }
    } catch (err) {
      openDialog("Lỗi kết nối", "Không thể kết nối đến server: " + err.message);
    }
  };

  return (
    <>
      {dialog.open && (
        <Dialog
          title={dialog.title}
          message={dialog.message}
          onClose={closeDialog}
          onConfirm={dialog.onConfirm}
        />
      )}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4">Nhập mã xác thực</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Mã 6 chữ số đã được gửi tới email:{" "}
            <strong>{email || "Không có email"}</strong>
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã OTP..."
              className="w-full text-center text-2xl tracking-widest border rounded-lg py-3"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Xác thực
            </button>
          </form>
          {message && (
            <p
              className={`text-center mt-4 text-sm ${message.includes("✅") ? "text-green-600" : "text-red-500"
                }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData;
  const email = formData?.email;

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("❌ Không có email để xác thực!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Xác thực thành công! Tạo tài khoản...");

        const registerRes = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const registerData = await registerRes.json();

        if (registerData.success) {
          alert("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login");
        } else {
          setMessage(registerData.message);
        }
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Lỗi kết nối đến server: " + err.message);
    }
  };

  return (
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
            className={`text-center mt-4 text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
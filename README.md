# 🌐 ỨNG DỤNG MẠNG XÃ HỘI VÀ DIỄN ĐÀN

Ứng dụng mạng xã hội và diễn đàn được phát triển bằng **ExpressJS**, **ReactJS**, **Tailwind**, **Sequelize** và **MySQL**. Hệ thống hỗ trợ đầy đủ các chức năng cho quản trị viên từ quản lý người dùng, quản lý bài viết đến thống kê và các chức năng cho người dùng như viết bài, bình luận, chia sẻ, theo dõi, ...
![Dashboard](/images/Dashboard.png)

---

## 📌 Nội dung

- [🎯 Tính năng](#-tính-năng)
- [⚙️ Cài đặt](#️-cài-đặt)
- [💻 Môi trường](#-môi-trường)
- [📚 Tài liệu tham khảo](#-tài-liệu-tham-khảo)
- [🐞 Bugs và vấn đề](#-bugs-và-các-vấn-đề)
- [🚧 Tính năng đang phát triển](#-tính-năng-đang-phát-triển)
- [👨‍💻 Tác giả](#-tác-giả)
- [📄 Giấy phép](#-giấy-phép)

---

## 🎯 Tính năng

### 🛠️ Quản trị viên:
- Xem thống kê (tổng số người dùng, tổng số bài viết, các hoạt động gần đây, …)
- Quản lý:
  - Người dùng:
    + Xem thông tin người dùng
    + Tìm kiếm người dùng
    + Kích hoạt, vô hiệu hóa tài khoản người dùng
  - Bài viết:
    + Xem chi tiết bài viết
    + Tìm kiếm bài viết
    + Phê duyệt, cấm bài viết
    + Duyệt bài viết tự động bằng AI

### 👤 Người dùng:
- Đăng ký và đăng nhập tài khoản
- Xem trang cá nhân và chỉnh sửa trang cá nhân
- Viết bài, xóa, sửa bài viết
- Bình luận, thả cảm xúc, chia sẻ bài viết
- Theo dõi người dùng khác

---

## ⚙️ Cài đặt

### a. Clone dự án

```bash
git clone https://github.com/endervos/8Express.git
```

### b. Cấu hình cơ sở dữ liệu

Mở file `backend/config/config.json` và cập nhật:

```bash
"username": "YOUR_USERNAME"
"password": "YOUR_PASSWORD"
```

### c. Chạy ứng dụng

- Khởi động bằng terminal của Visual Studio Code
- Cài đặt cơ sở dữ liệu:

```bash
cd .\backend\
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

- Khởi động server cho backend:

```bash
cd .\backend\
node server.js
```

- Khởi động server cho frontend:

```bash
cd .\frontend\
npm install
npm start
```

### d. Dữ liệu mẫu

Xem mọi dữ liệu mẫu trong file `backend/seeders/initial-data.js` hoặc file `database/Sample.sql`.

### e. Chạy bằng Docker *(tùy chọn)*

- Khởi động bằng terminal của Visual Studio Code
  + Nếu là lần đầu, chưa xây dựng container:

  ```bash
  docker compose up --build
  ```

  + Các lần sau chỉ cần chạy, không cần build lại nữa:

  ```bash
  docker compose up
  ```

---

## 💻 Môi trường

- NodeJS
- MySQL 8+
- Visual Studio Code
- Docker Desktop *(tuỳ chọn)*

---

## 📚 Tài liệu tham khảo

- Dịch vụ Email: [Brevo (ex-Sendinblue)](https://www.brevo.com/)

---

## 🐞 Bugs và các vấn đề

Gặp lỗi hoặc có thắc mắc? Hãy tạo [Issue](https://github.com/your-repo/issues) trên GitHub để được hỗ trợ.

---

## 🚧 Tính năng đang phát triển

- Triển khai server Ubuntu
- Host public cho Website
- Phát triển phiên bản mobile (Android/iOS)

---

## 👨‍💻 Tác giả

- Trần Phúc Tiến  
- Huỳnh Thanh Trà
- Tô Duy Hào

---
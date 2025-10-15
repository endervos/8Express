
// Dữ liệu giả định cho các người dùng

export const mockUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
    role: 'user',
    joinDate: '2024-01-15',
    totalPosts: 24,
    totalComments: 156,
    phone: '0901234567',
    bio: 'Đam mê lập trình web và chia sẻ kiến thức',
    lastLogin: '2025-10-01 14:30'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'tranthib@email.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'active',
    role: 'admin',
    joinDate: '2023-06-10',
    totalPosts: 89,
    totalComments: 342,
    phone: '0912345678',
    bio: 'Admin và Content Creator',
    lastLogin: '2025-10-02 09:15'
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    email: 'levancuong@email.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'banned',
    role: 'user',
    joinDate: '2024-05-20',
    totalPosts: 5,
    totalComments: 12,
    phone: '0923456789',
    bio: 'Đã bị cấm vì vi phạm quy tắc',
    lastLogin: '2024-08-01 10:00'
  },
  {
    id: 4,
    name: 'Phạm Thị Duyên',
    email: 'phamthiduyen@email.com',
    avatar: 'https://i.pravatar.cc/150?img=8',
    status: 'active',
    role: 'editor',
    joinDate: '2024-03-01',
    totalPosts: 120,
    totalComments: 550,
    phone: '0934567890',
    bio: 'Chuyên gia về sách và văn hóa',
    lastLogin: '2025-10-10 17:00'
  },
  {
    id: 5,
    name: 'Hoàng Văn Hải',
    email: 'hoangvanhai@email.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'inactive',
    role: 'user',
    joinDate: '2023-11-25',
    totalPosts: 10,
    totalComments: 30,
    phone: '0945678901',
    bio: 'Người dùng ít hoạt động',
    lastLogin: '2025-05-01 12:00'
  },
  {
    id: 6,
    name: 'Đỗ Văn Phúc',
    email: 'dovanphuc@email.com',
    avatar: 'https://i.pravatar.cc/150?img=15',
    status: 'active',
    role: 'user',
    joinDate: '2025-01-01',
    totalPosts: 50,
    totalComments: 200,
    phone: '0956789012',
    bio: 'Chuyên gia công nghệ',
    lastLogin: '2025-10-12 18:30'
  }
];

// Dữ liệu giả định cho các Chuyên mục/Chủ đề (đã thêm)
export const mockCategories = [
  { id: 101, name: 'Công nghệ', slug: 'cong-nghe', icon: 'zap', postCount: 120 },
  { id: 102, name: 'Sách & Văn hóa', slug: 'sach-van-hoa', icon: 'book', postCount: 85 },
  { id: 103, name: 'Khoa học', slug: 'khoa-hoc', icon: 'atom', postCount: 50 },
  { id: 104, name: 'Kinh tế & Tài chính', slug: 'kinh-te-tai-chinh', icon: 'trending-up', postCount: 95 },
  { id: 105, name: 'Cuộc sống', slug: 'cuoc-song', icon: 'sun', postCount: 150 },
  { id: 106, name: 'Lập trình', slug: 'lap-trinh', icon: 'code', postCount: 70 },
  { id: 107, name: 'Sức khỏe', slug: 'suc-khoe', icon: 'heart', postCount: 45 },
];

export const mockPosts = [
  {
    id: 1,
    title: 'Hướng dẫn sử dụng Tailwind CSS cho người mới',
    slug: 'huong-dan-su-dung-tailwind-css',
    author: 'Nguyễn Văn An',
    authorId: 1,
    category: 'Lập trình', // <--- Đã THÊM TRƯỜNG NÀY
    content: `# Tailwind CSS - The Utility-First CSS Framework
Tailwind là framework tuyệt vời. Dễ học, dễ dùng.
## Bắt đầu
Chỉ cần cài đặt và tận hưởng sự linh hoạt của các utility class.`,
    excerpt: 'Tìm hiểu về Tailwind CSS, framework CSS utility-first đang thịnh hành. Bài viết hướng dẫn cơ bản cho người mới bắt đầu.',
    status: 'published',
    priority: 'high',
    views: 4500,
    likes: 120,
    createdAt: '2025-10-10 10:00',
    updatedAt: '2025-10-10 12:30',
    publishedAt: '2025-10-10 12:30',
    comments: [
      { id: 1, userId: 2, userName: 'Trần Thị Bình', userAvatar: 'https://i.pravatar.cc/150?img=5', content: 'Bài viết rất hay, cảm ơn bạn!', createdAt: '2025-10-10 13:00', likes: 10 },
      { id: 2, userId: 4, userName: 'Phạm Thị Duyên', userAvatar: 'https://i.pravatar.cc/150?img=8', content: 'Tôi đã chuyển sang dùng Tailwind sau khi đọc bài này.', createdAt: '2025-10-10 14:00', likes: 5 }
    ]
  },
  {
    id: 2,
    title: 'Phân tích tình hình kinh tế 6 tháng cuối năm 2025',
    slug: 'phan-tich-kinh-te-6-thang-cuoi-nam',
    author: 'Trần Thị Bình',
    authorId: 2,
    category: 'Kinh tế & Tài chính', // <--- Đã THÊM TRƯỜNG NÀY
    content: `# Kinh tế Vĩ mô
Các chuyên gia dự đoán thị trường sẽ ổn định hơn vào cuối năm.
## Các chỉ số chính
GDP, lạm phát và tỷ giá hối đoái.`,
    excerpt: 'Dự báo và phân tích chi tiết tình hình kinh tế vĩ mô trong 6 tháng cuối năm, tập trung vào thị trường Việt Nam.',
    status: 'published',
    priority: 'medium',
    views: 9800,
    likes: 250,
    createdAt: '2025-10-05 08:00',
    updatedAt: '2025-10-06 09:00',
    publishedAt: '2025-10-06 09:00',
    comments: [
      { id: 3, userId: 1, userName: 'Nguyễn Văn An', userAvatar: 'https://i.pravatar.cc/150?img=1', content: 'Rất bổ ích cho việc đầu tư.', createdAt: '2025-10-06 10:00', likes: 20 },
    ]
  },
  {
    id: 3,
    title: 'Những cuốn sách triết học kinh điển bạn nên đọc',
    slug: 'sach-triet-hoc-kinh-dien',
    author: 'Phạm Thị Duyên',
    authorId: 4,
    category: 'Sách & Văn hóa', // <--- Đã THÊM TRƯỜNG NÀY
    content: `# Triết học cơ bản
Giới thiệu 5 cuốn sách định hình tư duy của nhân loại.
## Danh sách đề xuất
1. Cộng hòa (Plato)
2. Luận về Sự Sống và Cái Chết (Schopenhauer)
3. ...`,
    excerpt: 'Tuyển chọn 5 cuốn sách triết học kinh điển từ cổ đại đến hiện đại, giúp mở rộng tầm nhìn và phát triển tư duy phản biện.',
    status: 'published',
    priority: 'high',
    views: 6200,
    likes: 180,
    createdAt: '2025-09-28 15:00',
    updatedAt: '2025-09-28 16:30',
    publishedAt: '2025-09-29 09:00',
    comments: [
      { id: 4, userId: 3, userName: 'Lê Văn Cường', userAvatar: 'https://i.pravatar.cc/150?img=11', content: 'Tôi đã đọc cuốn của Plato, rất thấm!', createdAt: '2025-09-29 10:30', likes: 5 },
    ]
  },
  {
    id: 4,
    title: 'Bí quyết cân bằng giữa công việc và cuộc sống (Work-Life Balance)',
    slug: 'bi-quyet-work-life-balance',
    author: 'Nguyễn Văn An',
    authorId: 1,
    category: 'Cuộc sống', // <--- Đã THÊM TRƯỜNG NÀY
    content: `Cân bằng không phải là chia đều 50/50, mà là sự hài hòa.`,
    excerpt: 'Làm thế nào để tìm được sự hài hòa giữa áp lực công việc và nhu cầu cá nhân? Áp dụng các mẹo nhỏ để cải thiện chất lượng sống.',
    status: 'published',
    priority: 'low',
    views: 3100,
    likes: 95,
    createdAt: '2025-10-12 18:00',
    updatedAt: '2025-10-12 18:00',
    publishedAt: '2025-10-12 18:00', // Bài mới nhất
    comments: []
  },
  {
    id: 5,
    title: 'Tương lai của Trí tuệ Nhân tạo (AI) trong 5 năm tới',
    slug: 'tuong-lai-cua-tri-tue-nhan-tao',
    author: 'Đỗ Văn Phúc',
    authorId: 6,
    category: 'Công nghệ', // <--- Đã THÊM TRƯỜNG NÀY
    content: `AI sẽ thay đổi mọi ngành công nghiệp, từ y tế đến sản xuất.`,
    excerpt: 'Phân tích xu hướng và dự đoán sự phát triển của công nghệ AI, Machine Learning và ảnh hưởng của chúng đến thị trường lao động.',
    status: 'published',
    priority: 'high',
    views: 12500,
    likes: 350,
    createdAt: '2025-09-20 11:00',
    updatedAt: '2025-09-20 11:00',
    publishedAt: '2025-09-21 07:00',
    comments: [
      { id: 5, userId: 2, userName: 'Trần Thị Bình', userAvatar: 'https://i.pravatar.cc/150?img=5', content: 'Thật đáng sợ và thú vị!', createdAt: '2025-09-21 08:30', likes: 45 },
    ]
  },
  {
    id: 6,
    title: 'Quy tắc vàng để sống thọ và khỏe mạnh',
    slug: 'quy-tac-song-khoe-manh',
    author: 'Phạm Thị Duyên',
    authorId: 4,
    category: 'Sức khỏe', // <--- Đã THÊM TRƯỜNG NÀY
    content: `Tập thể dục, ăn uống cân bằng và ngủ đủ giấc.`,
    excerpt: 'Những thói quen đơn giản nhưng cực kỳ quan trọng giúp bạn duy trì một cơ thể khỏe mạnh và tinh thần minh mẫn.',
    status: 'published',
    priority: 'medium',
    views: 2800,
    likes: 70,
    createdAt: '2025-10-11 06:00',
    updatedAt: '2025-10-11 06:00',
    publishedAt: '2025-10-11 06:00',
    comments: []
  },
  {
    id: 7,
    title: 'Lập trình hàm (Functional Programming) là gì?',
    slug: 'functional-programming-la-gi',
    author: 'Nguyễn Văn An',
    authorId: 1,
    category: 'Lập trình', // <--- Đã THÊM TRƯỜNG NÀY
    content: `Tập trung vào hàm, tránh side effects và sử dụng tính bất biến.`,
    excerpt: 'Giới thiệu các khái niệm cốt lõi của Lập trình Hàm, ưu điểm và cách áp dụng trong các ngôn ngữ hiện đại.',
    status: 'draft', // Dùng cho Admin Dashboard
    priority: 'low',
    views: 0,
    likes: 0,
    createdAt: '2025-09-26 09:30',
    updatedAt: '2025-09-26 14:00',
    publishedAt: '2025-09-26 15:00',
    comments: []
  },
  {
    id: 8,
    title: 'Thuyết tương đối của Einstein: Giải thích đơn giản',
    slug: 'thuyet-tuong-doi-don-gian',
    author: 'Trần Thị Bình',
    authorId: 2,
    category: 'Khoa học', // <--- Đã THÊM TRƯỜNG NÀY
    content: `E = mc^2 là công thức nổi tiếng nhất, nhưng ý nghĩa thực sự của nó là gì?`,
    excerpt: 'Bài viết giải thích một cách dễ hiểu về Thuyết Tương đối Hẹp và Rộng của Albert Einstein, thời gian và không gian.',
    status: 'published',
    priority: 'medium',
    views: 7500,
    likes: 210,
    createdAt: '2025-09-15 10:00',
    updatedAt: '2025-09-15 10:00',
    publishedAt: '2025-09-15 10:00',
    comments: []
  }
];
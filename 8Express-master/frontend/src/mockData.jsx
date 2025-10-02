// Mock Data for Blog Forum Admin

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
    email: 'levanc@email.com',
    avatar: 'https://i.pravatar.cc/150?img=8',
    status: 'suspended',
    role: 'user',
    joinDate: '2024-03-22',
    totalPosts: 12,
    totalComments: 45,
    phone: '0923456789',
    bio: 'Học viên React và Node.js',
    lastLogin: '2025-09-28 16:45',
    suspendedReason: 'Vi phạm quy định đăng spam'
  },
  {
    id: 4,
    name: 'Phạm Thị Diệu',
    email: 'phamthid@email.com',
    avatar: 'https://i.pravatar.cc/150?img=9',
    status: 'active',
    role: 'user',
    joinDate: '2024-08-05',
    totalPosts: 31,
    totalComments: 98,
    phone: '0934567890',
    bio: 'Full-stack Developer, yêu thích JavaScript',
    lastLogin: '2025-10-02 11:20'
  },
  {
    id: 5,
    name: 'Hoàng Minh Em',
    email: 'hoangminhe@email.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'inactive',
    role: 'user',
    joinDate: '2023-12-18',
    totalPosts: 7,
    totalComments: 23,
    phone: '0945678901',
    bio: 'Newbie trong lĩnh vực lập trình',
    lastLogin: '2025-08-15 10:00'
  },
  {
    id: 6,
    name: 'Đỗ Văn Phúc',
    email: 'dovanp@email.com',
    avatar: 'https://i.pravatar.cc/150?img=15',
    status: 'active',
    role: 'user',
    joinDate: '2024-05-30',
    totalPosts: 45,
    totalComments: 201,
    phone: '0956789012',
    bio: 'Backend Developer, chuyên Node.js và MongoDB',
    lastLogin: '2025-10-02 08:45'
  }
];

export const mockPosts = [
  {
    id: 1,
    title: 'Hướng dẫn React Hooks từ cơ bản đến nâng cao',
    slug: 'huong-dan-react-hooks-co-ban-den-nang-cao',
    author: 'Nguyễn Văn An',
    authorId: 1,
    content: `
# React Hooks - Từ cơ bản đến nâng cao

React Hooks là một tính năng mạnh mẽ được giới thiệu từ React 16.8, cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class component.

## 1. useState Hook

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

useState là hook cơ bản nhất, cho phép bạn thêm state vào function component.

## 2. useEffect Hook

\`\`\`javascript
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

useEffect cho phép bạn thực hiện side effects trong component.

## 3. Custom Hooks

Bạn có thể tạo custom hooks để tái sử dụng logic...
    `,
    excerpt: 'Tìm hiểu về React Hooks từ những khái niệm cơ bản nhất đến các kỹ thuật nâng cao. Bài viết chi tiết về useState, useEffect và cách tạo custom hooks.',
    status: 'published',
    priority: 'high',
    views: 1234,
    likes: 89,
    category: 'React',
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    createdAt: '2025-09-28 10:30',
    updatedAt: '2025-09-29 14:20',
    publishedAt: '2025-09-28 15:00',
    comments: [
      {
        id: 1,
        userId: 4,
        userName: 'Phạm Thị Diệu',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        content: 'Bài viết rất chi tiết và dễ hiểu! Cảm ơn tác giả đã chia sẻ.',
        createdAt: '2025-09-28 16:45',
        likes: 5
      },
      {
        id: 2,
        userId: 6,
        userName: 'Đỗ Văn Phúc',
        userAvatar: 'https://i.pravatar.cc/150?img=15',
        content: 'Phần custom hooks có thể giải thích thêm không ạ?',
        createdAt: '2025-09-29 09:20',
        likes: 2
      }
    ]
  },
  {
    id: 2,
    title: 'Tailwind CSS: Styling hiện đại cho dự án web',
    slug: 'tailwind-css-styling-hien-dai',
    author: 'Trần Thị Bình',
    authorId: 2,
    content: `
# Tailwind CSS - Framework CSS tiện ích

Tailwind CSS là một utility-first CSS framework giúp bạn xây dựng giao diện nhanh chóng mà không cần rời khỏi HTML.

## Ưu điểm

- Không cần nghĩ tên class
- Dễ dàng responsive
- File size nhỏ khi production
- Customization linh hoạt

## Cài đặt

\`\`\`bash
npm install -D tailwindcss
npx tailwindcss init
\`\`\`
    `,
    excerpt: 'Khám phá Tailwind CSS - một trong những CSS framework phổ biến nhất hiện nay. Hướng dẫn cài đặt và sử dụng các utility classes.',
    status: 'published',
    priority: 'medium',
    views: 892,
    likes: 67,
    category: 'CSS',
    tags: ['tailwind', 'css', 'frontend', 'styling'],
    createdAt: '2025-09-30 08:15',
    updatedAt: '2025-09-30 08:15',
    publishedAt: '2025-09-30 09:00',
    comments: [
      {
        id: 3,
        userId: 1,
        userName: 'Nguyễn Văn An',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        content: 'Tailwind thực sự tiết kiệm thời gian! Bài viết hay!',
        createdAt: '2025-09-30 10:30',
        likes: 8
      }
    ]
  },
  {
    id: 3,
    title: 'JavaScript ES6: Arrow Functions và Destructuring',
    slug: 'javascript-es6-arrow-functions-destructuring',
    author: 'Lê Văn Cường',
    authorId: 3,
    content: `
# JavaScript ES6 Features

ES6 (ECMAScript 2015) mang đến nhiều tính năng mới giúp code JavaScript hiện đại và dễ đọc hơn.

## Arrow Functions

\`\`\`javascript
const add = (a, b) => a + b;
\`\`\`

## Destructuring

\`\`\`javascript
const { name, age } = person;
const [first, second] = array;
\`\`\`
    `,
    excerpt: 'Tìm hiểu về Arrow Functions và Destructuring - hai tính năng quan trọng của ES6 giúp code JavaScript ngắn gọn và dễ đọc hơn.',
    status: 'published',
    priority: 'low',
    views: 567,
    likes: 34,
    category: 'JavaScript',
    tags: ['javascript', 'es6', 'programming'],
    createdAt: '2025-09-25 14:00',
    updatedAt: '2025-09-26 10:00',
    publishedAt: '2025-09-26 11:00',
    comments: []
  },
  {
    id: 4,
    title: 'Node.js Best Practices cho Backend Developer',
    slug: 'nodejs-best-practices-backend',
    author: 'Phạm Thị Diệu',
    authorId: 4,
    content: `
# Node.js Best Practices

Những thực hành tốt nhất khi phát triển ứng dụng Node.js.

## 1. Error Handling
## 2. Security
## 3. Performance
## 4. Testing
    `,
    excerpt: 'Tổng hợp các best practices quan trọng khi làm việc với Node.js. Từ error handling, security đến performance optimization.',
    status: 'draft',
    priority: 'high',
    views: 0,
    likes: 0,
    category: 'Backend',
    tags: ['nodejs', 'backend', 'best-practices'],
    createdAt: '2025-10-01 16:30',
    updatedAt: '2025-10-02 09:15',
    publishedAt: null,
    comments: []
  },
  {
    id: 5,
    title: 'MongoDB Aggregation Pipeline: Truy vấn dữ liệu nâng cao',
    slug: 'mongodb-aggregation-pipeline',
    author: 'Đỗ Văn Phúc',
    authorId: 6,
    content: `
# MongoDB Aggregation Pipeline

Aggregation pipeline là một framework mạnh mẽ để xử lý dữ liệu trong MongoDB.

## Các stages phổ biến

- $match
- $group
- $project
- $sort
- $limit
    `,
    excerpt: 'Khám phá Aggregation Pipeline trong MongoDB - công cụ mạnh mẽ để thực hiện các truy vấn phức tạp và xử lý dữ liệu.',
    status: 'draft',
    priority: 'medium',
    views: 0,
    likes: 0,
    category: 'Database',
    tags: ['mongodb', 'database', 'backend'],
    createdAt: '2025-10-02 07:20',
    updatedAt: '2025-10-02 08:45',
    publishedAt: null,
    comments: []
  },
  {
    id: 6,
    title: 'Git & GitHub: Làm việc nhóm hiệu quả',
    slug: 'git-github-lam-viec-nhom',
    author: 'Nguyễn Văn An',
    authorId: 1,
    content: `
# Git & GitHub cho Team

Hướng dẫn sử dụng Git và GitHub để làm việc nhóm hiệu quả.

## Git Workflow
## Branching Strategy
## Pull Requests
## Code Review
    `,
    excerpt: 'Hướng dẫn chi tiết về cách sử dụng Git và GitHub để làm việc nhóm. Từ git workflow, branching strategy đến code review.',
    status: 'published',
    priority: 'medium',
    views: 745,
    likes: 56,
    category: 'DevOps',
    tags: ['git', 'github', 'version-control', 'teamwork'],
    createdAt: '2025-09-27 11:00',
    updatedAt: '2025-09-27 13:30',
    publishedAt: '2025-09-27 14:00',
    comments: [
      {
        id: 4,
        userId: 4,
        userName: 'Phạm Thị Diệu',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        content: 'Rất hữu ích cho newbie như mình. Thanks!',
        createdAt: '2025-09-27 15:20',
        likes: 12
      },
      {
        id: 5,
        userId: 6,
        userName: 'Đỗ Văn Phúc',
        userAvatar: 'https://i.pravatar.cc/150?img=15',
        content: 'Có thể giải thích thêm về rebase không?',
        createdAt: '2025-09-28 09:10',
        likes: 3
      },
      {
        id: 6,
        userId: 1,
        userName: 'Nguyễn Văn An',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        content: '@Đỗ Văn Phúc Mình sẽ viết một bài riêng về rebase nhé!',
        createdAt: '2025-09-28 10:30',
        likes: 5
      }
    ]
  },
  {
    id: 7,
    title: 'REST API Design: Thiết kế API chuẩn RESTful',
    slug: 'rest-api-design-chuan-restful',
    author: 'Trần Thị Bình',
    authorId: 2,
    content: `
# REST API Design Best Practices

Hướng dẫn thiết kế REST API theo chuẩn RESTful.

## HTTP Methods
- GET: Lấy dữ liệu
- POST: Tạo mới
- PUT: Cập nhật toàn bộ
- PATCH: Cập nhật một phần
- DELETE: Xóa

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error
    `,
    excerpt: 'Tìm hiểu cách thiết kế REST API chuẩn RESTful. HTTP methods, status codes, và best practices khi xây dựng API.',
    status: 'published',
    priority: 'high',
    views: 1089,
    likes: 92,
    category: 'Backend',
    tags: ['api', 'rest', 'backend', 'web-development'],
    createdAt: '2025-09-26 09:30',
    updatedAt: '2025-09-26 14:00',
    publishedAt: '2025-09-26 15:00',
    comments: [
      {
        id: 7,
        userId: 6,
        userName: 'Đỗ Văn Phúc',
        userAvatar: 'https://i.pravatar.cc/150?img=15',
        content: 'Bài viết rất chuyên nghiệp và đầy đủ!',
        createdAt: '2025-09-26 16:45',
        likes: 15
      }
    ]
  },
  {
    id: 8,
    title: 'Docker cho người mới bắt đầu',
    slug: 'docker-cho-nguoi-moi-bat-dau',
    author: 'Đỗ Văn Phúc',
    authorId: 6,
    content: `
# Docker - Containerization Platform

Docker giúp đóng gói ứng dụng và dependencies vào container.

## Các khái niệm cơ bản
- Image
- Container
- Dockerfile
- Docker Compose
    `,
    excerpt: 'Hướng dẫn Docker từ cơ bản cho người mới bắt đầu. Tìm hiểu về container, image, Dockerfile và Docker Compose.',
    status: 'draft',
    priority: 'low',
    views: 0,
    likes: 0,
    category: 'DevOps',
    tags: ['docker', 'devops', 'container'],
    createdAt: '2025-10-01 13:15',
    updatedAt: '2025-10-01 17:30',
    publishedAt: null,
    comments: []
  }
];

export const categories = [
  'React',
  'JavaScript', 
  'CSS',
  'Backend',
  'Database',
  'DevOps',
  'Frontend'
];

export const postStatuses = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  pending: 'Chờ duyệt'
};

export const userStatuses = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  suspended: 'Tạm khóa'
};
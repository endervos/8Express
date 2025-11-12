import { useEffect, useState } from 'react';
import { Users, FileText } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:5000/admin/stats?page=${page}&limit=5`);
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
          setActivities(json.data.recentActivities);
        }
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      }
    };
    fetchStats();
  }, [page]);

  if (!stats) return <div>Đang tải thống kê...</div>;

  const cardData = [
    { id: 1, title: 'Tổng người dùng', value: stats.totalUsers, icon: Users, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { id: 2, title: 'Tổng bài viết', value: stats.totalPosts, icon: FileText, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { id: 3, title: 'Người dùng mới tháng này', value: stats.newUsersThisMonth, icon: Users, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { id: 4, title: 'Bài viết mới tháng này', value: stats.newPostsThisMonth, icon: FileText, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cardData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-full`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500">Chưa có hoạt động nào gần đây.</p>
          ) : (
            activities.map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${act.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                    }`}
                >
                  {act.type === 'user' ? (
                    <Users className="text-blue-600" size={20} />
                  ) : (
                    <FileText className="text-green-600" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{act.title}</p>
                  <p className="text-gray-600 text-sm">{act.detail}</p>
                </div>
                <span className="text-gray-500 text-sm">{act.time}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-gray-700">
            Trang {page} / {stats.totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, stats.totalPages))}
            disabled={page === stats.totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stats;
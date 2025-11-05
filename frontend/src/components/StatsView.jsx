import React from 'react';
import { Users, FileText, BarChart3 } from 'lucide-react';

const StatsView = () => {
  const stats = [
    {
      id: 1,
      title: 'Tổng người dùng',
      value: '1,234',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Tổng bài viết',
      value: '567',
      icon: FileText,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      title: 'Lượt truy cập',
      value: '45.2K',
      icon: BarChart3,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white rounded-xl shadow-md p-6 fade-in">
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">Người dùng mới đăng ký</p>
              <p className="text-gray-600 text-sm">Nguyễn Văn A vừa tạo tài khoản</p>
            </div>
            <span className="text-gray-500 text-sm">5 phút trước</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">Bài viết mới</p>
              <p className="text-gray-600 text-sm">Trần Thị B đã đăng "Hướng dẫn React"</p>
            </div>
            <span className="text-gray-500 text-sm">15 phút trước</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">Lượt truy cập tăng</p>
              <p className="text-gray-600 text-sm">Tăng 23% so với hôm qua</p>
            </div>
            <span className="text-gray-500 text-sm">1 giờ trước</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
const CameraReadyPhase: React.FC = () => {
    const paperStatus = [
        { id: 1, step: 'Nộp bài báo', completed: true, date: '15/01/2025' },
        { id: 2, step: 'Xác nhận tiếp nhận', completed: true, date: '17/01/2025' },
        { id: 3, step: 'Phân công reviewer', completed: true, date: '20/01/2025' },
        { id: 4, step: 'Đánh giá bài báo', completed: false, date: 'Đang tiến hành' },
        { id: 5, step: 'Kết quả review', completed: false, date: 'Chờ xử lý' },
        { id: 6, step: 'Camera-ready', completed: false, date: 'Chờ xử lý' },
    ];

    const paperDetails = {
        title: 'Nghiên cứu về Machine Learning trong xử lý ngôn ngữ tự nhiên',
        conference: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
        submittedDate: '15/01/2025',
        reviewDeadline: '28/02/2025',
        status: 'Đang được đánh giá'
    };

    const actions = [
        { name: 'Xem chi tiết bài báo', progress: '100%', status: 'completed' },
        { name: 'Theo dõi phản hồi reviewer', progress: '60%', status: 'in-progress' },
        { name: 'Cập nhật thông tin tác giả', progress: '100%', status: 'completed' },
        { name: 'Chuẩn bị bản camera-ready', progress: '0%', status: 'pending' },
        { name: 'Đăng ký trình bày', progress: '0%', status: 'pending' },
    ];
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Giai đoạn Camera Ready</h3>
            <p className="text-gray-400 mb-4">
                Đây là nội dung chi tiết của giai đoạn **Camera Ready**.
            </p>
            <div className="bg-gray-700 p-4 rounded-lg">
                <p>Upload file camera-ready và đăng ký trình bày.</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                    3/6
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Tiến độ bài báo</h3>
                                    <p className="text-gray-400">Giai đoạn trước và sau chuyển đổi</p>
                                </div>
                            </div>

                            {/* Paper Details Card */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-2">{paperDetails.title}</h4>
                                <p className="text-sm text-gray-400 mb-1">Hội thảo: {paperDetails.conference}</p>
                                <p className="text-sm text-gray-400">Deadline review: {paperDetails.reviewDeadline}</p>
                                <div className="mt-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                                        {paperDetails.status}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Steps */}
                            <div className="space-y-4">
                                {paperStatus.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step.completed
                                            ? 'bg-blue-600 text-white'
                                            : index === 3
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-600 text-gray-400'
                                            }`}>
                                            {step.completed ? '✓' : index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`font-medium ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                                                    {step.step}
                                                </span>
                                                <span className="text-sm text-gray-400">{step.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Support */}
                        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-bold mb-4">Hỗ trợ được đề xuất</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Hướng dẫn định dạng bài báo</h4>
                                        <p className="text-sm text-gray-400">Tài liệu</p>
                                    </div>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                        Xem
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Template bài báo khoa học</h4>
                                        <p className="text-sm text-gray-400">Mẫu</p>
                                    </div>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                        Tải về
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Hỗ trợ kỹ thuật</h4>
                                        <p className="text-sm text-gray-400">Liên hệ</p>
                                    </div>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                        Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-bold mb-4">Hành động</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Danh sách các hành động cần thực hiện
                            </p>

                            <div className="space-y-4">
                                {actions.map((action, index) => (
                                    <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${action.status === 'completed'
                                                ? 'bg-green-500'
                                                : action.status === 'in-progress'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-gray-500'
                                                }`}></div>
                                            <span className="text-sm flex-1">{action.name}</span>
                                        </div>
                                        <div className="ml-6">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>{action.status === 'completed' ? 'Hoàn thành' : action.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}</span>
                                                <span>{action.progress}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-1">
                                                <div
                                                    className={`h-1 rounded-full ${action.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                                                        }`}
                                                    style={{ width: action.progress }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                                Bỏ qua
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraReadyPhase;
export default function Dialog({ open, title, message, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[360px] animate-fade">
                <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>
                <p className="text-gray-700 whitespace-pre-line mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Xác nhận
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
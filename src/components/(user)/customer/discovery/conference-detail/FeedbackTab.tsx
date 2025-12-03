import { Star } from "lucide-react";
import { ConferenceResponse, ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse } from "@/types/conference.type";

// Feedback Tab Component
interface FeedbackTabProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
  newFeedback: { name: string; rating: number; comment: string };
  setNewFeedback: (feedback: {
    name: string;
    rating: number;
    comment: string;
  }) => void;
  // feedbacks: any[];
  handleAddFeedback: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({
  conference,
  newFeedback,
  setNewFeedback,
  // feedbacks,
  handleAddFeedback,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Đánh giá từ khách hàng
      </h2>
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Thêm đánh giá của bạn</h3>
        <form onSubmit={handleAddFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên của bạn
            </label>
            <input
              type="text"
              value={newFeedback.name}
              onChange={(e) =>
                setNewFeedback({ ...newFeedback, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
              placeholder="Nhập tên của bạn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Đánh giá</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setNewFeedback({ ...newFeedback, rating: star })
                  }
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${star <= newFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-white/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nhận xét</label>
            <textarea
              value={newFeedback.comment}
              onChange={(e) =>
                setNewFeedback({ ...newFeedback, comment: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Gửi đánh giá
          </button>
        </form>
      </div>
      <div className="space-y-4">
        {/* {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6 text-white">
                        <div className="flex items-start gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                    src={feedback.avatar}
                                    alt={feedback.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-white">{feedback.name}</h4>
                                    <span className="text-sm text-white/70">{feedback.date}</span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-white">{feedback.comment}</p>
                            </div>
                        </div>
                    </div>
                ))} */}
      </div>
    </div>
  );
};

export default FeedbackTab;

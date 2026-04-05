export interface Feedback {
  id: string;
  query: string;
  answer: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: number;
  userId?: string;
}

class FeedbackStore {
  private STORAGE_KEY = 'app_feedback';

  saveFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>) {
    const feedbacks = this.getAllFeedback();
    const newFeedback: Feedback = {
      ...feedback,
      id: `fb_${Date.now()}`,
      timestamp: Date.now(),
    };
    feedbacks.push(newFeedback);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(feedbacks));
    return newFeedback;
  }

  getAllFeedback(): Feedback[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  getFeedbackForUser(userId: string): Feedback[] {
    return this.getAllFeedback().filter(f => f.userId === userId);
  }
}

export const feedbackStore = new FeedbackStore();

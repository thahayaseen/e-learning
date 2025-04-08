import { IReviewRepo } from "../../domain/repository/IReviewRepositroy";
import review, { IReview } from "../database/models/reiview";

class ReviewRepositroy implements IReviewRepo {
  async CreateReview(
    userid: string,
    courseid: string,
    rating: number,
    title: string,
    comment: string
  ): Promise<void> {
    await review.create({
      user_id: userid,
      courseId: courseid,
      rating: rating,
      title: title,
      comment: comment,
    });
    return;
  }
  async getReiview(courseid: string): Promise<IReview[]> {
    const data= await review.find({ courseId: courseid }).populate('user_id','name').sort({ createdAt: -1 });
    return data
  }
}
export default new ReviewRepositroy();

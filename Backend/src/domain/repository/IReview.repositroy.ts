import { IReview } from "../../infra/database/models/reiview";

export interface IReviewRepo {
  CreateReview(
    userid: string,
    courseid: string,
    rating: number,
    title: string,
    comment: string
  ): Promise<void>;
  getReiview(courseid: string): Promise<IReview[]>;
}

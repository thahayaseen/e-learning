export interface IProgressCollection {
  _id: string;
  Student_id: string | null;
  Course_id: ICourses | null;
  lesson_progress: {
    Completed: boolean | null;
    Lesson_id: string | null;
    WatchTime: number | null;
  }[];
  UpdatedAt: string | null;
  createdAt: string | null;
  Score: number;
}
export interface ICategory {
  _id?: string | number;
  Category: string;
  CourseId?: string[] | null;
  Description: string;
  unlist: boolean;
  UpdatedAt?: string | null;
  createdAt?: string | null | Date;
}
export interface ILesson {
  Lessone_name: string | null;
  Content: string | null;
  Task: string[] | null;
  _id: string;
}
export interface ITask {
  Type: "Quiz" | "Assignment" | "Video";
  Lesson_id: string;
}

export interface IQuizTask extends ITask {
  Question: string;
  Options: string[];
  Answer: string;
}

export interface IAssignmentTask extends ITask {
  Description: string;
}

// Video task interface
export interface IVideoTask extends ITask {
  VideoURL: string;
}
export interface ICourses {
  _id: string;
  Title: string | null;
  Mentor_id: UserDTO | null;
  Description: string | null;
  CreatedAt: string | null;
  Category: ICategory | null;
  Price: number | null;
  Approved_by_admin: "pending" | "rejected" | "approved";
  Students_enrolled: string[] | null;
  UpdatedAt: string | null;
  image: string;
  lessons: string[];
  Content: string | null;
  Offer_id: string | null;
  unlist: boolean;
}
export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Optional if using OAuth
  profile?: ProfileDTO; // Optional profile
  gid?: string | null; // Google ID for OAuth users
  verified?: boolean;
  isBlocked?: boolean;
  role: string;
  purchasedCourses?: string[];
  subscription?: string | null;
  UpdatedAt?: string;
}
export interface ProfileDTO {
  avatar?: string;
  experience?: number;
  social_link?: string;
  userid?: string;
}

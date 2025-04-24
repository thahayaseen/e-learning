import { ObjectId } from "mongoose";

// domain/entities/Course.ts
export class Course {
  constructor(
    public readonly id: string | null = null,
    public title: string | null,
    public mentorId: string | null,
    public description: string | null,
    public createdAt: Date | null = null,
    public category: string | null,
    public price: number | null,
    public approvedByAdmin: string = "pending",
    public studentsEnrolled: ObjectId[] | null = [],
    public updatedAt: Date | null = null,
    public image: string,
    public lessons: string[] | null,
    public content: string | null,
    public offerId: string | null = null,
    public unlist: boolean = false
  ) {}

  // Example business logic
  unlistCourse() {
    this.unlist = true;
  }

  publishCourse() {
    this.unlist = false;
  }

  approve(adminId: string) {
    this.approvedByAdmin = adminId;
  }

  updateContent(newContent: string | null) {
    this.content = newContent;
    this.updatedAt = new Date();
  }
}

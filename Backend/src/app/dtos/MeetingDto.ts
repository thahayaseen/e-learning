export interface MeetingDto {
  userId: string;
  mentorId: string;
  scheduledTime: Date;
  courseId: string;
  participants: string[];
  status:"pending"|"approved"|"rejected"|"canceled"
}

export interface Course {
  _id: string
  Title: string
  Mentor_id: {
    _id: string
    name: string
    mentorId?: string
  }
  Description: string
  lessons: Lesson[]
  Duration?: string
  Level?: string
  Category?: { Category: string }
  CreatedAt?: string
  lessons_progress?: any
  mentorId?: string
}

export interface Lesson {
  _id: string
  Lessone_name: string
  Content: string
  Task: Task[]
}

export interface Task {
  _id: string
  Type: string
  content?: string
  questions?: QuizQuestion[]
  description?: string
  Description?: string
  VideoURL?: string
  Question?: string
  Options?: any
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

export interface TaskProgress {
  id: string
  watchedDuration: number
  totalDuration: number
  isCompleted: boolean
  submissionData?: string
}

export interface Meeting {
  _id: string
  meetingTime: string
  meetingLink?: string
  status: string
}

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, Play, FileText, CheckCircle2 } from "lucide-react"

interface LearningProgressCardProps {
  overallProgress: number
  completedLessons: number
  totalLessons: number
  completedVideos: number
  totalVideos: number
  completedQuizzes: number
  totalQuizzes: number
  completedAssignments: number
  totalAssignments: number
  estimatedTimeLeft?: string
}

export const LearningProgressCard = ({
  overallProgress,
  completedLessons,
  totalLessons,
  completedVideos,
  totalVideos,
  completedQuizzes,
  totalQuizzes,
  completedAssignments,
  totalAssignments,
  estimatedTimeLeft,
}: LearningProgressCardProps) => {
  return (
    <Card className="border-gray-100 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Course Progress</span>
              <span className="font-semibold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2.5 bg-gray-100" />

            {estimatedTimeLeft && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Estimated time left: {estimatedTimeLeft}</span>
              </div>
            )}

            {overallProgress === 100 && (
              <div className="flex items-center mt-2 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                <span>Course completed! You can now get your certificate.</span>
              </div>
            )}
          </div>

          {/* Detailed Progress */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-md p-2.5 flex flex-col">
              <div className="flex items-center text-blue-700 text-xs font-medium mb-1.5">
                <BookOpen className="h-3 w-3 mr-1" />
                <span>Lessons</span>
              </div>
              <div className="mt-auto text-sm">
                <span className="font-semibold text-blue-700">{completedLessons}</span>
                <span className="text-blue-600">/{totalLessons}</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-md p-2.5 flex flex-col">
              <div className="flex items-center text-purple-700 text-xs font-medium mb-1.5">
                <Play className="h-3 w-3 mr-1" />
                <span>Videos</span>
              </div>
              <div className="mt-auto text-sm">
                <span className="font-semibold text-purple-700">{completedVideos}</span>
                <span className="text-purple-600">/{totalVideos}</span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-md p-2.5 flex flex-col">
              <div className="flex items-center text-amber-700 text-xs font-medium mb-1.5">
                <FileText className="h-3 w-3 mr-1" />
                <span>Quizzes</span>
              </div>
              <div className="mt-auto text-sm">
                <span className="font-semibold text-amber-700">{completedQuizzes}</span>
                <span className="text-amber-600">/{totalQuizzes}</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-md p-2.5 flex flex-col">
              <div className="flex items-center text-green-700 text-xs font-medium mb-1.5">
                <BookOpen className="h-3 w-3 mr-1" />
                <span>Assignments</span>
              </div>
              <div className="mt-auto text-sm">
                <span className="font-semibold text-green-700">{completedAssignments}</span>
                <span className="text-green-600">/{totalAssignments}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

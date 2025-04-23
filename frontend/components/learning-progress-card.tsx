import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Award, BookOpen, CheckCircle, Clock, Play, Target } from 'lucide-react';

interface ProgressCardProps {
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  completedVideos: number;
  totalVideos: number;
  completedQuizzes: number;
  totalQuizzes: number;
  completedAssignments: number;
  totalAssignments: number;
  estimatedTimeLeft?: string;
}

export function LearningProgressCard({
  overallProgress,
  completedLessons,
  totalLessons,
  completedVideos,
  totalVideos,
  completedQuizzes,
  totalQuizzes,
  completedAssignments,
  totalAssignments,
  estimatedTimeLeft = "2 hours",
}: ProgressCardProps) {
  return (
    <Card className="shadow-md border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Your Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-5">
          {/* Overall progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-primary">{overallProgress}%</span>
                {overallProgress === 100 && (
                  <Award className="h-4 w-4 ml-1 text-amber-500" />
                )}
              </div>
            </div>
            <Progress value={overallProgress} className="h-2.5 bg-gray-100" />
            
            {estimatedTimeLeft && overallProgress < 100 && (
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Estimated time to complete: {estimatedTimeLeft}</span>
              </div>
            )}
          </div>
          
          {/* Progress breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Play className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Videos</span>
                </div>
                <span className="text-xs font-medium">
                  {completedVideos}/{totalVideos}
                </span>
              </div>
              <Progress 
                value={(completedVideos / totalVideos) * 100} 
                className="h-1.5 bg-blue-100" 
              />
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Target className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                  <span className="text-xs font-medium text-gray-700">Quizzes</span>
                </div>
                <span className="text-xs font-medium">
                  {completedQuizzes}/{totalQuizzes}
                </span>
              </div>
              <Progress 
                value={(completedQuizzes / totalQuizzes) * 100} 
                className="h-1.5 bg-amber-100" 
              />
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Assignments</span>
                </div>
                <span className="text-xs font-medium">
                  {completedAssignments}/{totalAssignments}
                </span>
              </div>
              <Progress 
                value={(completedAssignments / totalAssignments) * 100} 
                className="h-1.5 bg-green-100" 
              />
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Lessons</span>
                </div>
                <span className="text-xs font-medium">
                  {completedLessons}/{totalLessons}
                </span>
              </div>
              <Progress 
                value={(completedLessons / totalLessons) * 100} 
                className="h-1.5 bg-purple-100" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Clock, Target } from 'lucide-react';

const LearningMentor = () => {
  const [progress, setProgress] = React.useState({
    course: 65,
    weekly: 80,
    streak: 12
  });

  const courses = [
    { title: "Python Fundamentals", progress: 85, totalHours: 20 },
    { title: "Web Development", progress: 45, totalHours: 30 },
    { title: "Data Science Basics", progress: 25, totalHours: 25 }
  ];

  const stats = [
    { icon: Trophy, label: "Current Streak", value: `${progress.streak} days` },
    { icon: Clock, label: "Study Time", value: "24h 30m" },
    { icon: Target, label: "Goals Met", value: "8/10" },
    { icon: BookOpen, label: "Courses", value: "3 Active" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Learner!</h1>
        <p className="opacity-90">You're making great progress. Keep up the momentum!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <stat.icon className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {courses.map((course, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{course.title}</span>
                <span className="text-sm text-gray-500">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              <p className="text-sm text-gray-500">
                Estimated time remaining: {Math.ceil((100 - course.progress) / 100 * course.totalHours)}h
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Study Hours Goal</span>
                <span>{progress.weekly}%</span>
              </div>
              <Progress value={progress.weekly} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">4/5</p>
                <p className="text-sm text-gray-600">Days Studied</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">3</p>
                <p className="text-sm text-gray-600">Quizzes Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningMentor;
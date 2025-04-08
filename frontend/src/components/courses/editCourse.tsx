"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import type {
  ILesson,
  ICourses,
  IQuizTask,
  IAssignmentTask,
  IVideoTask,
} from "@/services/interface/CourseDto";
import {
  addNewTaskDb,

  deleteTask,
  savelessonchanges,
} from "@/services/fetchdata";
import { toast } from "sonner";

interface EditLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ILesson | null;
  course: ICourses | null;
  onSave: (updatedLesson: ILesson) => Promise<void>;
  courses: ICourses[];
  setCourses: any;
}

const EditLessonDialog = ({
  isOpen,
  onClose,
  lesson,
  course,
  onSave,
  courses,
  setCourses,
}: EditLessonDialogProps) => {
  const [updatedLesson, setUpdatedLesson] = useState<ILesson | null>(null);
  const [updateLesson, setUpdatLessons] = useState<ILesson | null>(null);
  const [tasks, setTasks] = useState<
    (IQuizTask | IAssignmentTask | IVideoTask)[]
  >([]);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState<{
    Type: "Quiz" | "Assignment" | "Video";
    content: string;
    options?: string[];
    answer?: string;
    videoURL?: string;
  }>({
    Type: "Assignment",
    content: "",
    options: ["", "", "", ""],
    answer: "",
    videoURL: "",
  });
  console.log(updateLesson, "thsi is the lessons");

  // Initialize the form with lesson data when it changes
  useEffect(() => {
    if (lesson) {
      console.log(lesson, "lesson is ");

      setUpdatedLesson({ ...lesson });

      setTasks(lesson.Task);
    }
  }, [lesson]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!updatedLesson) return;

    setUpdatedLesson({
      ...updatedLesson,
      [e.target.name]: e.target.value,
    });
    setUpdatLessons((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTaskInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: string,
    optionIndex?: number
  ) => {
    const updatedTasks = [...tasks];
    const task = { ...updatedTasks[index] };

    if (
      field === "option" &&
      optionIndex !== undefined &&
      task.Type === "Quiz"
    ) {
      const quizTask = task as IQuizTask;
      const newOptions = [...quizTask.Options];
      newOptions[optionIndex] = e.target.value;
      quizTask.Options = newOptions;
    } else if (task.Type === "Quiz" && field === "Question") {
      (task as IQuizTask).Question = e.target.value;
    } else if (task.Type === "Quiz" && field === "Answer") {
      (task as IQuizTask).Answer = e.target.value;
    } else if (task.Type === "Assignment" && field === "Description") {
      (task as IAssignmentTask).Description = e.target.value;
    } else if (task.Type === "Video" && field === "VideoURL") {
      (task as IVideoTask).VideoURL = e.target.value;
    }

    updatedTasks[index] = task;
    setTasks(updatedTasks);
  };

  const handleNewTaskChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    field: string,
    optionIndex?: number
  ) => {
    if (field === "type") {
      setNewTask({
        ...newTask,
        Type: e.target.value as "Quiz" | "Assignment" | "Video",
      });
    } else if (field === "option" && optionIndex !== undefined) {
      const newOptions = [...(newTask.options || [])];
      newOptions[optionIndex] = e.target.value;
      setNewTask({
        ...newTask,
        options: newOptions,
      });
    } else {
      setNewTask({
        ...newTask,
        [field]: e.target.value,
      });
    }
  };

  const addNewTask = async (courseid: string) => {
    if (!updatedLesson) return;

    let taskToAdd: IQuizTask | IAssignmentTask | IVideoTask;

    if (newTask.Type === "Quiz") {
      taskToAdd = {
        Type: "Quiz",
        Lesson_id: updatedLesson._id,
        Question: newTask.content,
        Options: newTask.options || ["", "", "", ""],
        Answer: newTask.answer || "",
      };
    } else if (newTask.Type === "Assignment") {
      taskToAdd = {
        Type: "Assignment",
        Lesson_id: updatedLesson._id,
        Description: newTask.content,
      };
    } else {
      taskToAdd = {
        Type: "Video",
        Lesson_id: updatedLesson._id,
        VideoURL: newTask.videoURL || "",
      };
    }
    await addNewTaskDb(taskToAdd, updatedLesson._id, courseid);
    setTasks([...tasks, taskToAdd]);

    // Reset the new task form
    setNewTask({
      Type: "Assignment",
      content: "",
      options: ["", "", "", ""],
      answer: "",
      videoURL: "",
    });
  };

  const removeTask = async (
    index: number,
    taskid: string,
    courseid: string,
    lessonid: string
  ) => {
    console.log(lessonid);
    await deleteTask(taskid, lessonid, courseid);

    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const handleSave = async () => {
    if (!updatedLesson) return;

    setIsLoading(true);
    try {
      if (updateLesson) {
        await savelessonchanges(lesson?._id, updateLesson,course?._id);
        setUpdatLessons(null);
      }
      await onSave(updatedLesson);
      onClose();
    } catch (error:any) {
      console.error("Error saving lesson:", error);
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  };

  if (!updatedLesson || !course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-blue-900 text-white border-blue-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            Edit Lesson
            <Badge className="ml-2 bg-blue-700">{course.Title}</Badge>
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Make changes to lesson content and tasks
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Left sidebar - Course info */}
          <div className="space-y-4">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-blue-300 text-sm">Course Title</Label>
                  <div className="text-white font-medium">{course.Title}</div>
                </div>

                <div>
                  <Label className="text-blue-300 text-sm">Category</Label>
                  <div className="text-white">
                    {course.Category?.Category || "Uncategorized"}
                  </div>
                </div>

                <div>
                  <Label className="text-blue-300 text-sm">Status</Label>
                  <div>
                    {course.Approved_by_admin === "approved" ? (
                      <Badge className="bg-green-600 text-white flex items-center gap-1 mt-1">
                        <CheckCircle size={12} /> Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-600 text-white mt-1">
                        {course.Approved_by_admin}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-blue-300 text-sm">Total Lessons</Label>
                  <div className="text-white">
                    {course.lessons?.length || 0}
                  </div>
                </div>

                <Separator className="bg-blue-700" />

                <div className="text-sm text-blue-300">
                  Editing lesson{" "}
                  {course.lessons?.indexOf(updatedLesson._id) + 1 || "?"} of{" "}
                  {course.lessons?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="md:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-800 border-none">
                <TabsTrigger
                  value="details"
                  className="text-blue-300 data-[state=active]:bg-blue-700 data-[state=active]:text-white">
                  Lesson Details
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="text-blue-300 data-[state=active]:bg-blue-700 data-[state=active]:text-white">
                  Tasks & Assignments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="Lessone_name" className="text-white">
                    Lesson Name
                  </Label>
                  <Input
                    id="Lessone_name"
                    name="Lessone_name"
                    value={updatedLesson.Lessone_name || ""}
                    onChange={handleInputChange}
                    className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Content" className="text-white">
                    Lesson Content
                  </Label>
                  <Textarea
                    id="Content"
                    name="Content"
                    value={updatedLesson.Content || ""}
                    onChange={handleInputChange}
                    rows={12}
                    className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                  />
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-6">
                <div className="bg-blue-800 border border-blue-700 rounded-md p-4">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Current Tasks
                  </h3>

                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task, index) => (
                        <Card
                          key={index}
                          className="bg-blue-700 border-blue-600">
                          <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-md text-white flex items-center gap-2">
                              {task.Type === "Quiz" && "Quiz Question"}
                              {task.Type === "Assignment" && "Assignment"}
                              {task.Type === "Video" && "Video Content"}
                              <Badge className="bg-blue-900 text-xs">
                                {task.Type}
                              </Badge>
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-300 hover:text-red-300 hover:bg-blue-600"
                              onClick={() =>
                                removeTask(
                                  index,
                                  task._id,
                                  course._id,
                                  updatedLesson._id
                                )
                              }>
                              <Trash2 size={16} />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {task.Type === "Quiz" && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-blue-200">
                                    Question
                                  </Label>
                                  <Input
                                    value={(task as IQuizTask).Question}
                                    onChange={(e) =>
                                      handleTaskInputChange(
                                        e,
                                        index,
                                        "Question"
                                      )
                                    }
                                    className="bg-blue-800 border-blue-600 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-blue-200">
                                    Options
                                  </Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    {(task as IQuizTask).Options.map(
                                      (option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-sm">
                                            {String.fromCharCode(
                                              65 + optionIndex
                                            )}
                                          </div>
                                          <Input
                                            value={option}
                                            onChange={(e) =>
                                              handleTaskInputChange(
                                                e,
                                                index,
                                                "option",
                                                optionIndex
                                              )
                                            }
                                            className="bg-blue-800 border-blue-600 text-white"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-blue-200">
                                    Correct Answer
                                  </Label>
                                  <Input
                                    value={(task as IQuizTask).Answer}
                                    onChange={(e) =>
                                      handleTaskInputChange(e, index, "Answer")
                                    }
                                    className="bg-blue-800 border-blue-600 text-white"
                                  />
                                </div>
                              </>
                            )}

                            {task.Type === "Assignment" && (
                              <div className="space-y-2">
                                <Label className="text-blue-200">
                                  Assignment Description
                                </Label>
                                <Textarea
                                  value={(task as IAssignmentTask).Description}
                                  onChange={(e) =>
                                    handleTaskInputChange(
                                      e,
                                      index,
                                      "Description"
                                    )
                                  }
                                  className="bg-blue-800 border-blue-600 text-white"
                                  rows={4}
                                />
                              </div>
                            )}

                            {task.Type === "Video" && (
                              <div className="space-y-2">
                                <Label className="text-blue-200">
                                  Video URL
                                </Label>
                                <Input
                                  value={(task as IVideoTask).VideoURL}
                                  onChange={(e) =>
                                    handleTaskInputChange(e, index, "VideoURL")
                                  }
                                  className="bg-blue-800 border-blue-600 text-white"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-blue-300">
                      No tasks have been added to this lesson yet.
                    </div>
                  )}
                </div>

                <div className="bg-blue-800 border border-blue-700 rounded-md p-4">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Add New Task
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Task Type</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            newTask.Type === "Quiz" ? "default" : "outline"
                          }
                          className={
                            newTask.Type === "Quiz"
                              ? "bg-blue-600"
                              : "bg-blue-700 border-blue-600 text-blue-200"
                          }
                          onClick={() =>
                            setNewTask({ ...newTask, Type: "Quiz" })
                          }>
                          Quiz
                        </Button>
                        <Button
                          type="button"
                          variant={
                            newTask.Type === "Assignment"
                              ? "default"
                              : "outline"
                          }
                          className={
                            newTask.Type === "Assignment"
                              ? "bg-blue-600"
                              : "bg-blue-700 border-blue-600 text-blue-200"
                          }
                          onClick={() =>
                            setNewTask({ ...newTask, Type: "Assignment" })
                          }>
                          Assignment
                        </Button>
                        <Button
                          type="button"
                          variant={
                            newTask.Type === "Video" ? "default" : "outline"
                          }
                          className={
                            newTask.Type === "Video"
                              ? "bg-blue-600"
                              : "bg-blue-700 border-blue-600 text-blue-200"
                          }
                          onClick={() =>
                            setNewTask({ ...newTask, Type: "Video" })
                          }>
                          Video
                        </Button>
                      </div>
                    </div>

                    {newTask.Type === "Quiz" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-white">Question</Label>
                          <Input
                            value={newTask.content}
                            onChange={(e) => handleNewTaskChange(e, "content")}
                            placeholder="Enter quiz question"
                            className="bg-blue-700 border-blue-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Options</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {(newTask.options || []).map(
                              (option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-sm">
                                    {String.fromCharCode(65 + optionIndex)}
                                  </div>
                                  <Input
                                    value={option}
                                    onChange={(e) =>
                                      handleNewTaskChange(
                                        e,
                                        "option",
                                        optionIndex
                                      )
                                    }
                                    placeholder={`Option ${String.fromCharCode(
                                      65 + optionIndex
                                    )}`}
                                    className="bg-blue-700 border-blue-600 text-white"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Correct Answer</Label>
                          <Input
                            value={newTask.answer || ""}
                            onChange={(e) => handleNewTaskChange(e, "answer")}
                            placeholder="Enter the correct answer"
                            className="bg-blue-700 border-blue-600 text-white"
                          />
                        </div>
                      </>
                    )}

                    {newTask.Type === "Assignment" && (
                      <div className="space-y-2">
                        <Label className="text-white">
                          Assignment Description
                        </Label>
                        <Textarea
                          value={newTask.content}
                          onChange={(e) => handleNewTaskChange(e, "content")}
                          placeholder="Enter assignment instructions"
                          className="bg-blue-700 border-blue-600 text-white"
                          rows={4}
                        />
                      </div>
                    )}

                    {newTask.Type === "Video" && (
                      <div className="space-y-2">
                        <Label className="text-white">Video URL</Label>
                        <Input
                          value={newTask.videoURL || ""}
                          onChange={(e) => handleNewTaskChange(e, "videoURL")}
                          placeholder="Enter video URL"
                          className="bg-blue-700 border-blue-600 text-white"
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                      onClick={() => addNewTask(course._id)}>
                      <Plus size={16} className="mr-2" />
                      Add{" "}
                      {newTask.Type === "Quiz"
                        ? "Quiz"
                        : newTask.Type === "Assignment"
                        ? "Assignment"
                        : "Video"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-red-400 border-red-800 hover:bg-red-900 hover:text-red-200 flex items-center gap-1"
                onClick={async () => {
                  // This would typically show a confirmation dialog
                  try {
                    setIsLoading(true);
                    await deleteLesson(course._id, lesson?._id);
                    console.log("Delete course clicked");
                    toast.success("deleted success", {
                      description: "success",
                    });
                    const idex = courses.findIndex(
                      (couse) => couse._id == course._id
                    );
                    setCourses((prev) => prev.filter((_, i) => i !== idex));
                    onClose();
                  } catch (error) {
                    toast.error(error, {
                      description: "unExpeted Error",
                    });
                  }
                }}>
                <Trash2 size={16} />

                <span>Delete Task</span>
              </Button>
              <Button
                variant="outline"
                className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleSave}
                disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonDialog;

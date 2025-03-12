"use client";
import CourseBuyPage from "@/components/courses/buyCourse";
import { getAllcourseUser, getSelectedCourse } from "@/services/fetchdata";
import React, { useEffect, useState } from "react";
const dummyCourseData = {
  _id: "67c7c06ace6bf533fccdb433",
  Title: "Master Web Development from Scratch",
  Mentor_id: {
    _id: "mentor123",
    name: "John Doe",
    expertise: "Full Stack Web Developer",
  },
  Description:
    "A comprehensive course that takes you from beginner to professional web developer. Learn HTML, CSS, JavaScript, React, and more with hands-on projects.",
  Category: {
    _id: "cat456",
    name: "Web Development",
    icon: "code",
  },
  Price: 199.99,
  Approved_by_admin: "approved",
  Students_enrolled: [
    { _id: "student1", name: "Alice Smith" },
    { _id: "student2", name: "Bob Johnson" },
  ],
  image: "https://example.com/course-web-dev.jpg",
  lessons: [
    {
      _id: "67c71df397cdf0c08bec9dbf",
      Lessone_name: "Introduction to Web Development",
      Content:
        "Learn the basics of web development, understand the internet, and set up your development environment.",
      Task: [
        {
          _id: "67c7bbe7ce6bf533fccdb3dc",
          Type: "Video",
          VideoURL: "https://example.com/intro-video.mp4",
        },
        {
          _id: "67c7bbe7ce6bf533fccdb3dd",
          Type: "Quiz",
          Question: "What is HTML?",
          Options: [
            "A programming language",
            "A markup language",
            "A styling language",
            "A database",
          ],
          Answer: "A markup language",
        },
      ],
    },
    {
      _id: "67c71df397cdf0c08bec9dc0",
      Lessone_name: "HTML Fundamentals",
      Content:
        "Deep dive into HTML structure, tags, elements, and semantic markup.",
      Task: [
        {
          _id: "67c7bbe7ce6bf533fccdb3de",
          Type: "Video",
          VideoURL: "https://example.com/html-basics.mp4",
        },
        {
          _id: "67c7bbe7ce6bf533fccdb3df",
          Type: "Assignment",
          Description: "Create a personal webpage using HTML elements",
        },
      ],
    },
    {
      _id: "67c71df397cdf0c08bec9dc1",
      Lessone_name: "CSS Styling",
      Content:
        "Learn how to style your web pages using CSS, including layouts, flexbox, and grid.",
      Task: [
        {
          _id: "67c7bbe7ce6bf533fccdb3e0",
          Type: "Video",
          VideoURL: "https://example.com/css-styling.mp4",
        },
        {
          _id: "67c7bbe7ce6bf533fccdb3e1",
          Type: "Quiz",
          Question: "What does CSS stand for?",
          Options: [
            "Computer Style Sheets",
            "Creative Style Sheets",
            "Cascading Style Sheets",
            "Colorful Style Sheets",
          ],
          Answer: "Cascading Style Sheets",
        },
      ],
    },
  ],
  Content:
    "Comprehensive web development course covering front-end technologies",
  CreatedAt: new Date("2025-03-05T03:09:30.725Z"),
  UpdatedAt: new Date("2025-03-05T03:09:30.725Z"),
  __v: 0,
};
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
function Page() {
  const [loading, setloadin] = useState(false);
  const params = useParams();
  const [CourseData, SetCoursData] = useState(null);
  const [isaldredy,setisaldedy]=useState(false)
  useEffect(() => {
    const fn = async () => {
      try {
        if (params.id) {
          setloadin(true);
          const data = await getSelectedCourse(params.id as string);
          console.log(data,'datass');
          setisaldedy(data.adredypuchased)
          SetCoursData(data.data);
          setloadin(false);
        }
      } catch (error) {
        console.log('here');
        
        setloadin(false);
      }
    };
    fn();
  }, [params.id]);
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-white" size={50} />
          <p className="text-white mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      {CourseData && (
        <div>
          <CourseBuyPage course={CourseData} aldredypurchased={isaldredy}/>
        </div>
      )}
    </>
  );
}

export default Page;

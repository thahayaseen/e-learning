import React from 'react';
import { Card, CardContent,  } from '@/components/ui/card';
import { Book, BookOpen, Clock, Star, ArrowRight } from 'lucide-react';
import { Sighnout } from '@/components/mybtns/sighnout';
;

const HomePage = () => {
  const products = [
    {
      title: "Learning Management System",
      description: "Complete platform for managing online education",
      price: "$299",
      features: ["Course Creation", "Student Management", "Analytics Dashboard"]
    },
    {
      title: "Virtual Classroom",
      description: "Real-time online teaching solution",
      price: "$199",
      features: ["Live Sessions", "Screen Sharing", "Recording"]
    },
    {
      title: "Assessment Tool",
      description: "Comprehensive testing and evaluation system",
      price: "$149",
      features: ["Quiz Builder", "Auto Grading", "Progress Tracking"]
    }
  ];

  const courses = [
    {
      title: "Web Development Bootcamp",
      instructor: "Sarah Johnson",
      duration: "12 weeks",
      rating: 4.8,
      students: 1234
    },
    {
      title: "Data Science Fundamentals",
      instructor: "Michael Chen",
      duration: "8 weeks",
      rating: 4.9,
      students: 856
    },
    {
      title: "Digital Marketing Mastery",
      instructor: "Emma Davis",
      duration: "6 weeks",
      rating: 4.7,
      students: 2156
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">EduTech</h1>
          <div className="space-x-6">
            <button className="text-gray-300 hover:text-white">Products</button>
            <button className="text-gray-300 hover:text-white">Courses</button>
            <button className="text-gray-300 hover:text-white">About</button>
            <Sighnout/>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Transform Your Learning Journey</h1>
          <p className="text-xl text-gray-300 mb-8">Discover powerful tools and courses for modern education</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product,index) => (
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all" key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-gray-400 mb-4">{product.description}</p>
                  <p className="text-2xl font-bold text-blue-400 mb-4">{product.price}</p>
                  <ul className="space-y-2">
                    {product.features.map((feature,index) => (
                      <li className="text-gray-300 flex items-center gap-2" key={index}>
                        <ArrowRight className="h-4 w-4 text-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-6 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course,index) => (
              <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all" key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-white">{course.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
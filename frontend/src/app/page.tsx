"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Varify } from "@/lib/features/User";
import Header from "@/components/header/header";
import Hero from "@/components/homepage/hero";
import Products from "@/components/homepage/products";
import Plans from "@/components/homepage/Plans";
import Footer from "@/components/header/footer";
import { AppDispatch, storeType } from "@/lib/store";
import { getAllcourseUser } from "@/services/fetchdata";
import { ICourses } from "@/services/interface/CourseDto";
import { getImage } from "@/services/getImage";

const ELearningPlatform = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [courses, setCouse] = useState<ICourses[]>([]);
  const state = useSelector((state: storeType) => state.User);
  useEffect(() => {
    const varify = async () => {
      if (!state.isAuthenticated) {
        await dispatch(Varify());
      }
      const datas = await getAllcourseUser({ page: 1, limit: 4 }, true);
      setCouse(datas.courses);
    };
    varify();
  }, [dispatch, state.isAuthenticated]);
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <Header isLoggedIn={state.isAuthenticated} />

      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Featured Products
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover our most popular learning tools and resources designed to
              accelerate your skill development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Products
                category={course.Title}
                orderCount={100}
                id={course._id}
                price={String(course.Price)}
                smallDiscroption={course.Description}
                url={`${getImage(course.image)}`}
                key={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ELearningPlatform;

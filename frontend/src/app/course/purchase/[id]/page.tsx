"use client";
import React, { useEffect, useState } from "react";
import {
  Book,
  Clock,
  Users,
  Star,
  Check,
  ShoppingCart,
  CreditCard,
  Lock,
  ArrowRight,
  Gift,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { getSelectedCourse, purchaseCourse } from "@/services/fetchdata";
import { useParams ,useRouter} from "next/navigation";
import toast from "react-hot-toast";

const CoursePurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [courseDetails, SetcourseDetails] = useState();
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router=useRouter()
  useEffect(() => {
    const fn = async () => {
      if (params.id) {
        console.log(params.id, "id is");

        const data = await getSelectedCourse(params.id as string);
        console.log(data.data.data );

        SetcourseDetails(data.data.data);
        setLoading(false);
      }
    };
    fn();
  }, []);
  //   const courseDetails = {
  //     title: "Master Web Development: Full Stack Bootcamp",
  //     instructor: "Alex Rodriguez",
  //     rating: 4.8,
  //     students: 5200,
  //     duration: "36 hours",
  //     description: "Comprehensive web development course covering frontend, backend, and deployment. Learn modern technologies and build real-world projects from scratch.",
  //     curriculum: [
  //       "HTML5 & CSS3 Fundamentals",
  //       "JavaScript ES6+",
  //       "React.js Development",
  //       "Node.js & Express Backend",
  //       "Database Design with MongoDB",
  //       "REST API Development",
  //       "Deployment & DevOps Basics"
  //     ],
  //     plans: {
  //       standard: {
  //         price: 199,
  //         features: [
  //           "Full Course Access",
  //           "22 Detailed Modules",
  //           "Project Templates",
  //           "Q&A Support",
  //           "6-Month Access"
  //         ]
  //       },
  //       premium: {
  //         price: 299,
  //         features: [
  //           "Everything in Standard",
  //           "1:1 Mentorship (4 Sessions)",
  //           "Career Guidance",
  //           "Certificate of Completion",
  //           "Lifetime Course Updates",
  //           "Priority Support"
  //         ]
  //       }
  //     }
  //   };
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
  const handlePurchase = async () => {
  try {
    const dat= await purchaseCourse(params.id as string);
    console.log(dat,'ansis');
    if(dat){
        toast.success('purchase success')
        router.push('/')
    }
  } catch (error) {
    console.log('here');
    toast.error(error.message)
    router.push('/')
    // console.log(error.message);
    
  }
   
  };
  return (
    <div className="bg-[#0F172A] text-white min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden">
        {/* Course Overview Section */}
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Course Details Column */}
          <div>
            <div className="bg-[#2563EB]/20 p-4 rounded-lg mb-6">
              <h1 className="text-3xl font-bold text-blue-300 mb-4">
                {courseDetails.Title}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="text-yellow-500 mr-2" size={24} />
                  <span className="text-blue-100">
                    {/* {courseDetails.rating} Rating */}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="text-green-500 mr-2" size={24} />
                  <span className="text-blue-100">
                    {/* {courseDetails.students} Students */}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="text-purple-500 mr-2" size={24} />
                  <span className="text-blue-100">
                    {/* {courseDetails.duration} */}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-blue-100 mb-6">{courseDetails.Description}</p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-300">
                Course Lessons
              </h3>
              <ul className="space-y-2">
                {courseDetails.lessons.map((item, index) => (
                  <li key={index} className="flex items-center text-blue-100">
                    <Check className="text-green-500 mr-2" size={20} />
                    <span>{item.Lessone_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing and Payment Column */}
          <div>
            {/* Plan Selection */}
            <div className="bg-[#334155] rounded-lg p-6 mb-6">
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setSelectedPlan("standard")}
                  className={`mr-4 px-4 py-2 rounded-lg transition-all ${
                    selectedPlan === "standard"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1E293B] text-blue-300 hover:bg-blue-900"
                  }`}>
                  Standard Plan
                </button>
                <button
                  onClick={() => setSelectedPlan("premium")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedPlan === "premium"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1E293B] text-blue-300 hover:bg-blue-900"
                  }`}>
                  Premium Plan
                </button>
              </div>

              <div className="text-center  mb-6">
                <div className="flex justify-center align-middle items-center">
                  <IndianRupee color="blue" />
                  <h2 className="text-4xl font-bold text-blue-400">
                    {courseDetails.Price}
                  </h2>
                </div>
                <p className="text-blue-200">One-time payment</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Plan Features
                </h3>
                {/* <ul className="space-y-3">
                  {courseDetails.plans[selectedPlan].features.map(
                    (feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul> */}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-[#334155] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex items-center justify-center p-4 rounded-lg transition-all ${
                    paymentMethod === "credit"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1E293B] text-blue-300 hover:bg-blue-900"
                  }`}>
                  <CreditCard className="mr-2" size={24} />
                  Credit Card
                </button>
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-center p-4 rounded-lg transition-all ${
                    paymentMethod === "paypal"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1E293B] text-blue-300 hover:bg-blue-900"
                  }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path d="M10.5 14.25H9.75v-5.5h.75c1.519 0 2.75 1.231 2.75 2.75s-1.231 2.75-2.75 2.75zM12 3C7.031 3 3 7.031 3 12s4.031 9 9 9 9-4.031 9-9-4.031-9-9-9zm0 16.5c-4.142 0-7.5-3.358-7.5-7.5S7.858 4.5 12 4.5s7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5z" />
                  </svg>
                  PayPal
                </button>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-blue-200 mb-2">
                    Card Number
                  </label>
                  <div className="flex items-center bg-[#1E293B] rounded-lg p-3">
                    <CreditCard className="text-blue-400 mr-2" size={20} />
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="bg-transparent w-full text-blue-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-200 mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-[#1E293B] text-blue-100 p-3 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 mb-2">CVV</label>
                    <div className="flex items-center bg-[#1E293B] rounded-lg p-3">
                      <Lock className="text-blue-400 mr-2" size={20} />
                      <input
                        type="text"
                        placeholder="123"
                        className="bg-transparent w-full text-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon and Promo */}
              <div className="mt-6 bg-[#1E293B] rounded-lg p-4 flex items-center">
                <Gift className="text-blue-400 mr-3" size={24} />
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="bg-transparent w-full text-blue-100 outline-none"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-2">
                  Apply
                </button>
              </div>

              {/* Enroll Button */}
              <button
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition mt-6 flex items-center justify-center"
                onClick={() => handlePurchase()}>
                Complete Purchase
                <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchasePage;

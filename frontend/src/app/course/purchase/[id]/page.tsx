"use client";
import React, { useEffect, useState } from "react";
import {
  Book,
  Clock,
  Users,
  Star,
  Check,
  Loader2,
  IndianRupee,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getSelectedCourse, purchaseCourse } from "@/services/fetchdata";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Footer } from "react-day-picker";

// Initialize Stripe with your publishable key
const stripePromise = await loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CoursePurchasePage = () => {
  const [courseDetails, setCourseDetails] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (params.id && typeof params.id == "string") {
        try {
          const data = await getSelectedCourse(params.id);
          setCourseDetails(data.data.data);
        } catch (error) {
          toast.error("Failed to load course details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourseDetails();
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

  const handleCheckout = async () => {
    try {
      setProcessingPayment(true);

      const purchaseData = {
        courseId: params.id,
        price: courseDetails.Price,
        courseName: courseDetails.Title,
        planType: "standard",
      };

      if (params.id && typeof params.id == "string") {
        const session: any = await purchaseCourse(params.id, purchaseData);

        if (!session?.success) {
          const errorData = await session.data;
          throw new Error(
            errorData?.message || "Failed to create checkout session"
          );
        }

        if (session.orderid) {
          localStorage.setItem("orderid", session.orderid);
        }

        if (!session || !session.id) {
          throw new Error("Invalid checkout session");
        }

        if (stripePromise) {
          const { error } = await stripePromise.redirectToCheckout({
            sessionId: session.id,
          });

          if (error) {
            throw new Error(error.message);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || error.data?.message || "Payment failed", {
        duration: 1000,
      });
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto bg-slate-800/80 backdrop-blur rounded-xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Course Details Column (3/5 width) */}
          <div className="md:col-span-3 p-8">
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-6 rounded-xl mb-6 border border-blue-700/30">
              <h1 className="text-3xl font-bold text-blue-200 mb-4">
                {courseDetails.Title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-lg">
                  <Star className="text-yellow-400 mr-2" size={18} />
                  <span className="text-blue-100">
                    {courseDetails.rating || "New Course"}
                  </span>
                </div>
                <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-lg">
                  <Users className="text-green-400 mr-2" size={18} />
                  <span className="text-blue-100">
                    {courseDetails.students || "0"} Students
                  </span>
                </div>
                <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-lg">
                  <Clock className="text-purple-400 mr-2" size={18} />
                  <span className="text-blue-100">
                    {courseDetails.duration || "Self-paced"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-blue-100 mb-8 leading-relaxed">
              {courseDetails.Description}
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                <Book className="mr-2" size={20} />
                Course Curriculum
              </h3>
              <div className="bg-slate-900/60 rounded-lg p-4">
                <ul className="space-y-3">
                  {courseDetails.lessons &&
                    courseDetails.lessons.map((item: any, index: number) => (
                      <li
                        key={index}
                        className="flex items-center text-blue-100 p-2 hover:bg-slate-800/60 rounded-lg transition-colors">
                        <Check
                          className="text-emerald-500 mr-3 flex-shrink-0"
                          size={18}
                        />
                        <span>{item.Lessone_name}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Column (2/5 width) */}
          <div className="md:col-span-2 bg-slate-900 p-8">
            <div className="sticky top-8">
              {/* Price Display */}
              <div className="text-center mb-8 bg-gradient-to-br from-blue-800/30 to-purple-900/30 p-6 rounded-xl border border-blue-600/20">
                <p className="text-blue-300 mb-2">Course Price</p>
                <div className="flex justify-center items-center">
                  <IndianRupee className="text-blue-400" size={24} />
                  <h2 className="text-5xl font-bold text-blue-200 ml-1">
                    {courseDetails.Price}
                  </h2>
                </div>
                <p className="text-blue-300 mt-2 text-sm">One-time payment</p>
              </div>

              {/* Course Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">
                  What You'll Get
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-blue-100">
                    <Check className="text-emerald-500 mr-3" size={20} />
                    <span>Full lifetime course access</span>
                  </li>
                  <li className="flex items-center text-blue-100">
                    <Check className="text-emerald-500 mr-3" size={20} />
                    <span>All exercise solutions included</span>
                  </li>
                  <li className="flex items-center text-blue-100">
                    <Check className="text-emerald-500 mr-3" size={20} />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center text-blue-100">
                    <Check className="text-emerald-500 mr-3" size={20} />
                    <span>24/7 community support</span>
                  </li>
                </ul>
              </div>

              {/* Payment Security Info */}
              <div className="bg-blue-950/50 rounded-lg p-4 mb-6 border border-blue-800/30">
                <div className="flex items-center mb-2">
                  <Lock className="text-emerald-500 mr-2" size={20} />
                  <span className="text-blue-100 font-medium">
                    Secure Payment
                  </span>
                </div>
                <p className="text-blue-200 text-sm">
                  Your payment is processed securely through Stripe with 256-bit
                  SSL encryption.
                </p>
              </div>

              {/* Purchase Button */}
              <button
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition mt-6 flex items-center justify-center font-medium ${
                  processingPayment ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleCheckout}
                disabled={processingPayment}>
                {processingPayment ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Enroll Now
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-blue-400 text-sm mt-4">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursePurchasePage;

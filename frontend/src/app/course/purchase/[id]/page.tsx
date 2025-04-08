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
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = await loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CoursePurchasePage = () => {
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit");
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
          console.error(error);
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

  const handleStripeCheckout = async () => {
    try {
      setProcessingPayment(true);

      const datas = {
        courseId: params.id,
        planType: selectedPlan,
        price:
          selectedPlan === "premium"
            ? courseDetails.PremiumPrice || courseDetails.Price * 1.5
            : courseDetails.Price,
        courseName: courseDetails.Title,
      };
      console.log(datas, "data issisisisisi");
      if (params.id && typeof params.id == "string") {
        const session: any = await purchaseCourse(params.id, datas);
        console.log(session);
        if (!session?.success) {
          const errorData = await session.data;
          throw new Error(
            errorData?.message || "Failed to create checkout session"
          );
        }
        if (session.orderid) {
          localStorage.setItem("orderid", session.orderid);
        }

        console.log(session, "sesstopj is ");

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
          console.log(error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || error.data.message || "Payment failed");
      console.error("Payment error:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePurchase = async () => {
    // Handle PayPal or other payment methods
    try {
      if (paymentMethod === "credit") {
        handleStripeCheckout();
      }
      // const result = await purchaseCourse(params.id);
      // if (result) {
      //   toast.success("Purchase successful");
      //   router.push("/");
      // }
    } catch (error: any) {
      toast.error(error.message || "Purchase failed");
      router.push("/");
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
                    {courseDetails.rating || "No ratings yet"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="text-green-500 mr-2" size={24} />
                  <span className="text-blue-100">
                    {courseDetails.students || "0"} Students
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="text-purple-500 mr-2" size={24} />
                  <span className="text-blue-100">
                    {courseDetails.duration || "Self-paced"}
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
                {courseDetails.lessons &&
                  courseDetails.lessons.map((item: any, index: number) => (
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

              <div className="text-center mb-6">
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
                <ul className="space-y-3">
                  {selectedPlan === "standard" ? (
                    <>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Full course access</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Basic exercise solutions</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Certificate of completion</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Full course access</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Advanced exercise solutions</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>1-on-1 instructor support</span>
                      </li>
                      <li className="flex items-center text-blue-100">
                        <Check className="text-green-500 mr-2" size={20} />
                        <span>Lifetime updates</span>
                      </li>
                    </>
                  )}
                </ul>
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

              {paymentMethod === "credit" && (
                <div className="bg-[#1E293B] rounded-lg p-4 mb-6">
                  <p className="text-blue-200 mb-2">
                    You'll be redirected to our secure payment partner Stripe to
                    complete your purchase.
                  </p>
                  <div className="flex items-center">
                    <Lock className="text-green-500 mr-2" size={20} />
                    <span className="text-blue-100">
                      256-bit SSL encrypted payment
                    </span>
                  </div>
                </div>
              )}

              {/* Coupon and Promo */}
              {/* <div className="mt-6 bg-[#1E293B] rounded-lg p-4 flex items-center">
                <Gift className="text-blue-400 mr-3" size={24} />
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="bg-transparent w-full text-blue-100 outline-none"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-2">
                  Apply
                </button>
              </div> */}

              {/* Enroll Button */}
              <button
                className={`w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition mt-6 flex items-center justify-center ${
                  processingPayment ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handlePurchase}
                disabled={processingPayment}>
                {processingPayment ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Purchase
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchasePage;

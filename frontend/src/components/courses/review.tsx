"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSelector } from "react-redux";
import { storeType } from "@/lib/store";
import { addReview, getallreviews } from "@/services/fetchdata";
import ListReview from "./ListReview";
import { CheckCircle, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Zod validation schema
const ReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  comment: z
    .string()
    .trim()
    .min(10, "Comments must be at least 10 characters")
    .max(500, "Comments must be less than 500 characters"),
});

const CourseRatingComponent = ({ courseid }: { courseid: string }) => {
  const [hover, setHover] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Initialize form with Zod schema and react-hook-form
  const form = useForm<z.infer<typeof ReviewSchema>>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = await getallreviews(courseid);
        setReviews(result.data || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, [courseid]);

  // Handle star selection
  const handleStarSelect = (starValue: number) => {
    form.setValue("rating", starValue);
    setDialogOpen(true);
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof ReviewSchema>) => {
    try {
      const newReview: any = {
        courseid: courseid,
        rating: data.rating,
        title: data.title || `${data.rating}-Star Review`,
        comment: data.comment,
        createdAt: new Date().toISOString(),
      };

      const datassss = await addReview(newReview);
      console.log(datassss, "reiview is ");
      newReview.user_id = {
        name: state?.name,
      };
      // Update reviews locally
      setReviews((prevReviews) => [newReview, ...prevReviews]);

      // Reset form and show success message
      form.reset();
      setDialogOpen(false);
      setSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };
  const state = useSelector((states: storeType) => states.User.user);
  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="w-full mt-8">
      <Card className="bg-white border border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 py-6 px-6">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-full">
              <Star className="text-amber-500" size={24} />
            </div>
            Course Ratings & Reviews
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertDescription>
                Thank you! Your review has been submitted successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <Label className="block text-gray-700 font-medium mb-4 text-center text-lg">
              How would you rate this course?
            </Label>
            <div className="flex items-center justify-center mb-4 bg-gray-50 p-8 rounded-xl shadow-inner">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className="bg-transparent border-none px-2 cursor-pointer text-5xl focus:outline-none transition-all hover:scale-110"
                    onClick={() => handleStarSelect(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}>
                    <Star
                      size={48}
                      className={`
                        ${
                          starValue <= (hover || form.watch("rating"))
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-200 fill-transparent"
                        }
                        transition-colors duration-200
                      `}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-center text-gray-500 mt-2 font-medium">
              {hover > 0 ? ratingLabels[hover - 1] : "Click to rate"}
            </p>
          </div>

          {/* Dialog for review details */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="bg-white border border-gray-100 rounded-xl shadow-xl text-gray-800 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={24}
                        className={
                          index < form.watch("rating")
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-200 fill-transparent"
                        }
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700">
                    {form.watch("rating") > 0
                      ? ratingLabels[form.watch("rating") - 1]
                      : ""}{" "}
                    Review
                  </span>
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Review Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Summarize your experience"
                            className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Your Comments
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your detailed experience with this course..."
                            rows={4}
                            className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="sm:justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white">
                      Submit Review
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Reviews List */}
          <ListReview reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseRatingComponent;

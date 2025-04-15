"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useUploadS3 from "@/hooks/addtis3";
import { cn } from "@/lib/utils";
import { beaMentor } from "@/services/fetchdata";
import { useSocket } from "@/hooks/socketio";
import toast from "react-hot-toast";
import Image from "next/image";

// Form schema with validation
const formSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long"),
  mobile: z.string().min(10, "Mobile number should be 10 numbers"),
  qualification: z.string().min(5, "It should be more than 5 characters"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  profileLink: z.string().url("Please enter a valid URL"),
  availableTime: z.date(),
  reason: z.string().min(10, "Minimum 10 words required"),
  email: z.string().email("Please enter a valid email address"),
  profileImage: z.instanceof(File).optional(),
  idProof: z.instanceof(File).optional(),
});

function BeMentorFill() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const { uploading, uploadtos3 } = useUploadS3();
  const socket = useSocket();
  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      mobile: "",
      qualification: "",
      experience: 0,
      profileLink: "",
      availableTime: new Date(),
      reason: "",
      email: "",
      profileImage: undefined,
      idProof: undefined,
    },
  });

  // Handle image file changes
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("profileImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("idProof", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      console.log("datais ", values);
      if (values.idProof) {
        const idprofurl = await uploadtos3(values.idProof, "image");
        console.log(idprofurl);
        values.idProof = idprofurl ? idprofurl : null;
      }
      if (values.profileImage) {
        const profileimage = await uploadtos3(values.profileImage, "image");
        values.profileImage = profileimage ? profileimage : null;
      }
      console.log(values, "all datais ");
      await beaMentor(values);
      console.log("socket is ", socket);

      socket?.emit("SubmitForm", { values });
      toast.success("Form submitted successfully!");
      form.reset();
      setProfileImagePreview(null);
      setIdProofPreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Be A Mentor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            BE A MENTOR
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Qualification */}
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Master's in Computer Science"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profile Link */}
              <FormField
                control={form.control}
                name="profileLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn/Portfolio URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/johndoe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Available Time */}
              <FormField
                control={form.control}
                name="availableTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Available From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}>
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profile Image */}
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <div className="flex flex-col space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                  {profileImagePreview && (
                    <div className="mt-2">
                      <Image
                        width={100}
                        height={100}
                        src={profileImagePreview}
                        alt="Profile Preview"
                        className="w-20 h-20 object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
                <FormMessage>
                  {form.formState.errors.profileImage?.message}
                </FormMessage>
              </FormItem>

              {/* ID Proof */}
              <FormItem>
                <FormLabel>ID Proof</FormLabel>
                <div className="flex flex-col space-y-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdProofChange}
                  />
                  {idProofPreview && (
                    <div className="mt-2">
                      <Image
                        width={100}
                        height={100}
                        src={idProofPreview}
                        alt="ID Proof Preview"
                        className="w-20 h-auto object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                <FormMessage>
                  {form.formState.errors.idProof?.message}
                </FormMessage>
              </FormItem>

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to be a mentor?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your motivation and what you can offer as a mentor..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BeMentorFill;

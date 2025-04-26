"use client";
import React, { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Camera, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { updateData } from "@/services/fetchdata";
import useUploadS3 from "@/hooks/addtos3";
import { getImage } from "@/services/getImage";

// Zod schema for validation
const ProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  email: z.string().email({ message: "Invalid email address" }),
  profile: z
    .object({
      avatar: z.string().optional(),
      experience: z.number().optional(),
      social_link: z.string().url({ message: "Invalid URL" }).optional(),
    })
    .optional(),
});

// Interface for EditProfileDialog props
interface EditProfileProps {
  user: {
    name: string;
    username?: string;
    email: string;
    role: "admin" | "student" | "mentor";
    verified?: boolean;
    isBlocked?: boolean;
    profile?: {
      avatar?: string;
      experience?: number;
      social_link?: string;
      userid?: string;
    };
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedUser: z.infer<typeof ProfileSchema>) => void;
  onAvatarChange?: () => void;
  onDatachange?: () => void;
}

const EditProfileDialog: React.FC<EditProfileProps> = ({
  user,
  isOpen,
  onOpenChange,
  onSave,
  onAvatarChange,
  onDatachange,
}) => {
  // Initialize the form with Zod validation
  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      email: user.email,
      profile: {
        avatar: user.profile?.avatar,
        experience: user.profile?.experience,
        social_link: user.profile?.social_link,
      },
    },
  });

  // State management
  const [updatedData, setUpdatedData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadtos3, uploading } = useUploadS3();
  const [newImage, setNewimage] = useState(null);
  const [imageFile, setImagefile] = useState(null);
  const imageref = useRef(null);
   // Handle input changes
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof z.infer<typeof ProfileSchema>, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setUpdatedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof ProfileSchema>) => {
    try {
      let datas = { ...data };
      let newUpdatedData = { ...updatedData };
      setIsSubmitting(true);
      let avatarUrl = user.profile?.avatar;

      // Upload image if a new file is selected
      if (imageFile) {
        avatarUrl = await uploadtos3(imageFile, "image");
        if (avatarUrl) {
          newUpdatedData = {
            ...newUpdatedData,
            ...{
              avathar: avatarUrl,
            },
          };
          datas = {
            ...datas,
            profile: {
              ...data.profile,
              avatar: avatarUrl,
            },
          };
        }
      }

       // Update data and close dialog
      await updateData(newUpdatedData);
      setNewimage(null);
      setNewimage(null);
      setUpdatedData({});
       onSave(datas);
      onOpenChange(false);
    } catch (error) {
 
      // Optionally add error handling toast or message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image edit button click
  const handelEditimage = () => {
    imageref.current.click();
  };

  // Handle image file change
  const handlechangeimage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    setImagefile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewimage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
   return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className=" text-white border-blue-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Edit Profile</DialogTitle>
          <DialogDescription className="text-blue-200">
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full bg-blue-900 flex items-center justify-center">
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                  </div>
                ) : user.profile?.avatar || newImage ? (
                  <Image
                    width={100}
                    height={100}
                    src={newImage ? newImage : getImage(user.profile.avatar)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-blue-400" />
                )}
                <button
                  type="button"
                  onClick={onAvatarChange}
                  className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-1">
                  <input
                    type="file"
                    ref={imageref}
                    hidden
                    onChange={handlechangeimage}
                  />
                  <Edit
                    onClick={handelEditimage}
                    className="w-4 h-4 text-white"
                  />
                </button>
              </div>
            </div>

            {/* Basic Info Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={handlechange}
                      className="bg-blue-900 text-white border-blue-800 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      {...field}
                      className="bg-blue-900 text-white border-blue-800 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      {...field}
                      type="email"
                      className="bg-blue-900 text-white border-blue-800 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Extra Fields */}
            <FormField
              control={form.control}
              name="profile.social_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Social Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={handlechange}
                      placeholder="Add your portfolio or social media link"
                      className="bg-blue-900 text-white border-blue-800 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel className="text-blue-200">Role</FormLabel>
                <Input
                  value={user.role}
                  disabled
                  className="bg-blue-900 text-blue-400 border-blue-800 cursor-not-allowed"
                />
              </div>
              <div>
                <FormLabel className="text-blue-200">Experience</FormLabel>
                <Input
                  type="number"
                  value={user.profile?.experience || 0}
                  disabled
                  className="bg-blue-900 text-blue-400 border-blue-800 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-between text-sm text-blue-300">
              <span>Verified: {user.verified ? "Yes" : "No"}</span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-blue-300 border-blue-800 hover:bg-blue-900">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
                className="bg-blue-700 text-white hover:bg-blue-600">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

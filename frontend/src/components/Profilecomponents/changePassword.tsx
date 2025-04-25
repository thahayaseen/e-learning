import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React from "react";
import { DialogHeader } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { changepassword } from "@/services/fetchdata";
const schema = z
  .object({
    oldPassoword: z.string().min(8, "Password Must be greaterthan 8 letters"),
    newPassword: z
      .string()
      .min(8, "Please type new password minimum 8 letters"),
    newPassword2: z
      .string()
      .min(8, "Please type new password minimum 8 letters"),
  })
  .refine((data) => data.newPassword === data.newPassword2, {
    message: "Password must be same",
    path: ["newPassword2"],
  });
function ChangePassword({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (type:boolean) => void;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data) => {
    try {
       const res = await changepassword(data);
       if(res.success){
        form.reset()
        setOpen(false)
      }
    } catch (error) {
      if (error instanceof Error) {
         form.setError("oldPassoword", { message: error.message });
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>Change password</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Please Enter Old Password and New Password
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="oldPassoword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please Enter Old Password"
                      {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="please enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conform Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please Enter new passwod again"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePassword;

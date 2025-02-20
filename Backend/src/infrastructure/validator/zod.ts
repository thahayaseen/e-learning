import { z } from "zod";

export const UserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verified: z.boolean(),
    role: z.enum(["admin", "student", "mentor"]),
    purchasedCourses: z.array(z.string()),
    subscription: z.string().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;

export function validateUser(data: any) {
    return UserSchema.safeParse(data); 
}

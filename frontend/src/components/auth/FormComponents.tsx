// import React from "react";
// import { Field, ErrorMessage } from "formik";
// import { Input } from "@/components/ui/input";
// import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

// interface FormFieldProps {
//   name: string;
//   label: string;
//   type: string;
//   placeholder: string;
//   icon: React.ReactNode;
//   errors: any;
//   touched: any;
//   showPassword?: boolean;
//   togglePassword?: () => void;
// }

// export const FormField = ({
//   name,
//   label,
//   type,
//   placeholder,
//   icon,
//   errors,
//   touched,
//   showPassword,
//   togglePassword
// }: FormFieldProps) => {
//   return (
//     <div>
//       <label className="block mb-2 text-sm font-medium">{label}</label>
//       <div className="relative">
//         <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5">
//           {icon}
//         </div>
//         <Field name={name}>
//           {({ field }: any) => (
//             <Input
//               {...field}
//               type={type === "password" && showPassword ? "text" : type}
//               placeholder={placeholder}
//               className={`pl-10 ${type === "password" ? "pr-10" : ""} bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 ${
//                 errors[name] && touched[name] ? 'border-red-500' : ''
//               }`}
//             />
//           )}
//         </Field>
        
//         {type === "password" && togglePassword && (
//           <button
//             type="button"
//             onClick={togglePassword}
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white">
//             {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//           </button>
//         )}
        
//         <ErrorMessage name={name}>
//           {(msg: string) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
//         </ErrorMessage>
//       </div>
//     </div>
//   );
// };

// // Predefined field configurations for reuse
// export const EmailField = ({ errors, touched }: { errors: any, touched: any }) => (
//   <FormField
//     name="email"
//     label="Email"
//     type="email"
//     placeholder="Enter your email"
//     icon={<Mail />}
//     errors={errors}
//     touched={touched}
//   />
// );

// export const PasswordField = ({ 
//   errors, 
//   touched, 
//   showPassword, 
//   togglePassword 
// }: { 
//   errors: any, 
//   touched: any,
//   showPassword: boolean,
//   togglePassword: () => void
// }) => (
//   <FormField
//     name="password"
//     label="Password"
//     type="password"
//     placeholder="Enter password"
//     icon={<Lock />}
//     errors={errors}
//     touched={touched}
//     showPassword={showPassword}
//     togglePassword={togglePassword}
//   />
// );

// export const ConfirmPasswordField = ({ 
//   errors, 
//   touched, 
//   showPassword, 
//   togglePassword 
// }: { 
//   errors: any, 
//   touched: any,
//   showPassword: boolean,
//   togglePassword: () => void
// }) => (
//   <FormField
//     name="confirmPassword"
//     label="Confirm Password"
//     type="password"
//     placeholder="Confirm password"
//     icon={<Lock />}
//     errors={errors}
//     touched={touched}
//     showPassword={showPassword}
//     togglePassword={togglePassword}
//   />
// );

// export const NameField = ({ errors, touched }: { errors: any, touched: any }) => (
//   <FormField
//     name="name"
//     label="Name"
//     type="text"
//     placeholder="Enter your name"
//     icon={<User />}
//     errors={errors}
//     touched={touched}
//   />
// );
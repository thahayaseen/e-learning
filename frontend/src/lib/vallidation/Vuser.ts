
export interface User {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isLogin: boolean;
  role?:string
}
export function validateAuthForm({ name, email, password, confirmPassword, isLogin }: User) {
    const errors: Record<string, string> = {};
     // Email validation
    if (!email.trim()) {
       errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address';
    }
  
    // Password validation
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  
    // Additional signup validations
    if (!isLogin) {
      if (!name?.trim()) {
        errors.name = 'Name is required';
      }
  
      if (!confirmPassword?.trim()) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
  
    return errors;
  };

export default validateAuthForm;

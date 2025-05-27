"use client"

import { useState } from "react"

function UseForm() {
  const [islogin, setLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Reset password visibility when toggling between login/signup
  const toggleLogin = () => {
    setLogin((prev) => !prev)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return {
    islogin,
    showPassword,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    togglePasswordVisibility,
    toggleLogin,
  }
}

export default UseForm


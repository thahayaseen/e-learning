"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Profile, Sighnout } from "../mybtns/myBtns";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { storeType } from "@/lib/store";
// import { useSelector } from "react-redux";

function Header({
  forceFixed = false,
}: {
  isLoggedIn?: boolean;
  forceFixed?: boolean;
}) {
  const state = useSelector((state: storeType) => state.User);
  const isLoggedIn = state.isAuthenticated;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFixed, setFixed] = useState(forceFixed);
  const router = useRouter();

  // Debounced scroll handler to reduce lag
  // const handleScroll = useCallback(() => {
  //   // Using requestAnimationFrame to optimize performance
  //   requestAnimationFrame(() => {
  //     if (window.scrollY > 50) {
  //       setFixed(true);
  //     } else if (!forceFixed) {
  //       setFixed(false);
  //     }
  //   });
  // }, [forceFixed]);

  // Toggle functions
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  // Handle clicks outside the profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (isProfileMenuOpen && !target.closest("[data-profile-menu]")) {
        closeProfileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  // Handle scroll for fixed header - improved with throttling
  // useEffect(() => {
  //   let scrollTimeout;

  //   const throttledScrollHandler = () => {
  //     if (!scrollTimeout) {
  //       scrollTimeout = setTimeout(() => {
  //         handleScroll();
  //         scrollTimeout = null;
  //       }, 100); // Adjust the throttle time as needed
  //     }
  //   };

  //   window.addEventListener("scroll", throttledScrollHandler, { passive: true });
  //   return () => window.removeEventListener("scroll", throttledScrollHandler);
  // }, [handleScroll]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Navigation links array for DRY code
  const navLinks = [{ text: "Courses", href: "/course" }];

  return (
    <header
      className={`transition-all duration-300 ease-in-out ${
        isFixed ? "fixed top-0 left-0 opacity-95 shadow-md" : "relative"
      } w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50`}
      style={{ transform: isFixed ? "translateZ(0)" : "" }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}>
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 w-8 h-8 rounded-md flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="font-bold text-white">E</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            EduSphere
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 font-medium relative group">
              {link.text}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              {/* Profile Button with Dropdown */}
              <div className="relative" data-profile-menu>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700"
                  onClick={toggleProfileMenu}>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="font-medium">Profile</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 animate-fadeIn">
                    <div className="py-1">
                      <Profile />
                      <div className="border-t border-gray-700 my-1">
                        {" "}
                        {state.user.role !== "student" && (
                          <Button
                            onClick={() => {
                              router.push("/" + state.user.role);
                            }}>
                            Got to {state.user.role} Panel
                          </Button>
                        )}
                      </div>
                      <div className="px-4 py-2">
                        <Sighnout isLoggedIn={isLoggedIn} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <Sighnout isLoggedIn={isLoggedIn} />
            </div>
          )}

          {/* Mobile View - Sign In/Out Button */}
          <div className="md:hidden">
            {!isMenuOpen && <Sighnout isLoggedIn={isLoggedIn} />}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 animate-slideDown">
          <div className="container mx-auto px-4 py-3">
            {/* Profile Section for Mobile (when logged in) */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 py-3 border-b border-gray-700">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium">Your Profile</h3>
                  <p className="text-gray-400 text-sm">
                    View and edit your profile
                  </p>
                </div>
              </div>
            )}

            <nav className="flex flex-col space-y-4 py-2">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                  {link.text}
                </a>
              ))}

              {/* Mobile Additional Menu Items when Logged In */}
              {isLoggedIn && (
                <>
                  <a
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                    Dashboard
                  </a>
                  <a
                    href="/settings"
                    className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                    Settings
                  </a>
                </>
              )}

              {/* Mobile login controls */}
              {!isLoggedIn && (
                <div className="flex flex-col gap-3 pt-2 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    className="text-gray-300 justify-start px-0 hover:text-white"
                    onClick={() => router.push("/login")}>
                    Log in
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white"
                    onClick={() => router.push("/signup?path=register")}>
                    Sign up
                  </Button>
                </div>
              )}

              {/* Show signout in mobile menu for logged in users */}
              {isLoggedIn && (
                <div className="pt-2 border-t border-gray-700">
                  <Sighnout isLoggedIn={isLoggedIn} />
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 500px;
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
          overflow: hidden;
        }
      `}</style>
    </header>
  );
}

export default Header;

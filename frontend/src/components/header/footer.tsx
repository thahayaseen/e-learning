import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";

function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 w-8 h-8 rounded flex items-center justify-center">
                <span className="font-bold text-white">E</span>
                {/* <Image src="/logo.png" width={100} height={100} alt="logo" /> */}
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                Edu-Learn
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Transform your learning journey with our interactive courses and
              expert-led instruction.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 p-0">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path d="M22 5.16c-.94.42-1.95.7-3 .87a5.52 5.52 0 001.62-2.8c-.71.46-1.5.8-2.34.97a4.67 4.67 0 00-8 4.27A13.3 13.3 0 013 4.3a4.67 4.67 0 001.44 6.24A4.63 4.63 0 013 10v.06a4.67 4.67 0 003.75 4.58 4.65 4.65 0 01-2.1.08 4.67 4.67 0 004.35 3.24 9.37 9.37 0 01-5.8 2 9.78 9.78 0 01-1.2-.07 13.23 13.23 0 007.15 2.09c8.52 0 13.2-7.5 13.2-14 0-.21 0-.43-.02-.65a9.96 9.96 0 002.42-2.56" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 p-0">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 p-0">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2zM8 17.94V6.06L19 12l-11 5.94z" />
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  All Courses
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Learning Paths
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Certificates
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Student Success Stories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Learning Resources</h3>
            <ul className="space-y-3">
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Study Guides
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Live Workshops
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Practice Exercises
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Student Forum
                </a>
              </li>
              <li>
                <a className="text-gray-400 hover:text-white transition-colors">
                  Instructor Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>
            © 2025 EduSphere. All rights reserved. |{" "}
            <a className="hover:text-white">Privacy Policy</a> |{" "}
            <a className="hover:text-white">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

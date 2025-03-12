import React from 'react'
import { Button } from '../ui/button'

function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 w-8 h-8 rounded flex items-center justify-center">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">EduSphere</span>
          </div>
          <p className="text-gray-400 mb-4">Transform your skills with our comprehensive online learning platform.</p>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 5.16c-.94.42-1.95.7-3 .87a5.52 5.52 0 001.62-2.8c-.71.46-1.5.8-2.34.97a4.67 4.67 0 00-8 4.27A13.3 13.3 0 013 4.3a4.67 4.67 0 001.44 6.24A4.63 4.63 0 013 10v.06a4.67 4.67 0 003.75 4.58 4.65 4.65 0 01-2.1.08 4.67 4.67 0 004.35 3.24 9.37 9.37 0 01-5.8 2 9.78 9.78 0 01-1.2-.07 13.23 13.23 0 007.15 2.09c8.52 0 13.2-7.5 13.2-14 0-.21 0-.43-.02-.65a9.96 9.96 0 002.42-2.56" />
              </svg>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5 0-.23 0-.86-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.4.2 2.44.1 2.69.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Free Resources</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-4">Resources</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Webinars</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-4">Subscribe</h3>
          <p className="text-gray-400 mb-4">Get the latest updates and promotions.</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white" />
            </div>
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
        <p>© 2025 EduSphere. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer

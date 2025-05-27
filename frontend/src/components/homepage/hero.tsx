import React from 'react'
import { Button } from '../ui/button'
import { BookOpen, ChevronRight, Globe, Users } from 'lucide-react'

function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-slate-950 to-indigo-950">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-sm font-medium">Revolutionary Learning Experience</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Learn Without <span className="italic">Limits</span>,{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Anytime, Anywhere
              </span>
            </h1>
            
            <p className="text-lg text-slate-300">
              Unlock your potential with our cutting-edge learning platform designed 
              for curious minds and ambitious professionals.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-indigo-500 text-indigo-300 hover:bg-indigo-950/50">
                Browse Courses
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-300">25K+</div>
                  <div className="text-indigo-200/70">Active Students</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-300">5K+</div>
                  <div className="text-indigo-200/70">Premium Courses</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-800/50 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-300">250+</div>
                  <div className="text-indigo-200/70">Expert Instructors</div>
                </div>
              </div>
            </div>
          </div>
          
     
        </div>
      </div>
    </section>
  )
}

export default Hero
import React from 'react'
import { Button } from '../ui/button'
import { Badge, ChevronRight } from 'lucide-react'

function Hero() {
  return (
    <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-indigo-900 text-indigo-300 hover:bg-indigo-900">New Learning Experience</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Learn Without Limits, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Anytime, Anywhere</span></h1>
              <p className="text-gray-400 mb-8 text-lg">Access over 5,000 expert-led courses and hands-on labs to master the skills that will transform your career.</p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 px-6">Explore Courses</Button>
                <Button variant="outline" className="gap-2">
                  Watch Demo <ChevronRight size={16} />
                </Button>
              </div>
              
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-400">25K+</div>
                  <div className="text-gray-400">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">5K+</div>
                  <div className="text-gray-400">Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">250+</div>
                  <div className="text-gray-400">Instructors</div>
                </div>
              </div>
            </div>
            
            {/* <div className="rounded-xl overflow-hidden shadow-2xl shadow-indigo-950/30">
              <img src="/api/placeholder/600/400" alt="Learning platform showcase" className="w-full" />
            </div> */}
          </div>
        </div>
      </section>
  )
}

export default Hero

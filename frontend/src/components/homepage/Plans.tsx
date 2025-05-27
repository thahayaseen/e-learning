import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'

function Plans() {
  return (
<Card className="bg-gray-800 border-gray-700 relative">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-400 mt-2">For individuals just starting their learning journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-indigo-400" />
                    <span>Access to 1,000+ courses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-indigo-400" />
                    <span>Basic progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-indigo-400" />
                    <span>Mobile access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-indigo-400" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
            
  )
}

export default Plans

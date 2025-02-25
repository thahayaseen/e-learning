"use client"
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronUp, Users, BookOpen, MessageSquare, Bell, BarChart3, Settings, User, LogOut, TrendingUp, Award } from 'lucide-react';

const MentorDashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

  // Sample data
  const upcomingSessions = [
    { id: 1, name: "John Smith", time: "Today, 2:00 PM", topic: "Career Development", color: "bg-indigo-100 text-indigo-800" },
    { id: 2, name: "Emily Wang", time: "Tomorrow, 10:00 AM", topic: "Technical Skills", color: "bg-emerald-100 text-emerald-800" },
    { id: 3, name: "Michael Johnson", time: "Feb 27, 3:30 PM", topic: "Leadership", color: "bg-amber-100 text-amber-800" }
  ];

  const mentees = [
    { id: 1, name: "John Smith", progress: 75, lastActive: "2 hours ago", color: "bg-blue-500" },
    { id: 2, name: "Emily Wang", progress: 45, lastActive: "Yesterday", color: "bg-purple-500" },
    { id: 3, name: "Michael Johnson", progress: 90, lastActive: "Just now", color: "bg-emerald-500" },
    { id: 4, name: "Sarah Brown", progress: 30, lastActive: "3 days ago", color: "bg-amber-500" }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col">
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold text-blue-300 flex items-center gap-2">
            <BookOpen size={20} />
            MentorHub
          </h1>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <SidebarItem 
              icon={<BarChart3 size={18} />} 
              label="Dashboard" 
              active={activeMenuItem === 'dashboard'} 
              onClick={() => setActiveMenuItem('dashboard')} 
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              label="My Mentees" 
              active={activeMenuItem === 'mentees'} 
              onClick={() => setActiveMenuItem('mentees')} 
            />
            <SidebarItem 
              icon={<Calendar size={18} />} 
              label="Sessions" 
              active={activeMenuItem === 'sessions'} 
              onClick={() => setActiveMenuItem('sessions')} 
            />
            <SidebarItem 
              icon={<MessageSquare size={18} />} 
              label="Messages" 
              active={activeMenuItem === 'messages'} 
              onClick={() => setActiveMenuItem('messages')} 
              badge="3"
            />
            <SidebarItem 
              icon={<BookOpen size={18} />} 
              label="Resources" 
              active={activeMenuItem === 'resources'} 
              onClick={() => setActiveMenuItem('resources')} 
            />
          </div>
          
          <div className="pt-6 mt-6 border-t border-blue-700">
            <SidebarItem 
              icon={<Bell size={18} />} 
              label="Notifications" 
              active={activeMenuItem === 'notifications'} 
              onClick={() => setActiveMenuItem('notifications')} 
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              label="Settings" 
              active={activeMenuItem === 'settings'} 
              onClick={() => setActiveMenuItem('settings')} 
            />
          </div>
        </nav>
        
        <div className="p-4 border-t border-blue-700 bg-blue-800 bg-opacity-40">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-blue-400">
              <AvatarImage src="/api/placeholder/30/30" alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">Jane Doe</p>
              <p className="text-xs text-blue-300">Senior Mentor</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Welcome back, Jane</h1>
            <p className="text-blue-600">Here's what's happening with your mentees today.</p>
          </header>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Mentees" 
              value="12" 
              icon={<Users className="h-5 w-5 text-white" />} 
              change={<span className="text-green-500 flex items-center"><ChevronUp className="h-4 w-4" /> 8%</span>} 
              color="from-blue-500 to-blue-600"
              iconBg="bg-blue-400"
            />
            <StatCard 
              title="Active Sessions" 
              value="4" 
              icon={<Calendar className="h-5 w-5 text-white" />} 
              color="from-indigo-500 to-purple-600"
              iconBg="bg-indigo-400"
            />
            <StatCard 
              title="Completion Rate" 
              value="78%" 
              icon={<Award className="h-5 w-5 text-white" />} 
              change={<span className="text-green-500 flex items-center"><ChevronUp className="h-4 w-4" /> 12%</span>} 
              color="from-emerald-500 to-teal-600"
              iconBg="bg-emerald-400"
            />
            <StatCard 
              title="Unread Messages" 
              value="7" 
              icon={<MessageSquare className="h-5 w-5 text-white" />} 
              color="from-amber-500 to-orange-600"
              iconBg="bg-amber-400"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <Card className="border-none shadow-lg overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription className="text-blue-100">Your scheduled mentoring sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                          <AvatarFallback className={`text-white bg-gradient-to-br from-blue-500 to-indigo-600`}>
                            {session.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-800">{session.name}</p>
                          <p className="text-sm text-slate-500">{session.time}</p>
                        </div>
                      </div>
                      <Badge className={session.color}>{session.topic}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Mentee Progress */}
            <Card className="border-none shadow-lg overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                <CardTitle>Mentee Progress</CardTitle>
                <CardDescription className="text-indigo-100">Track your mentees' development</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {mentees.map(mentee => (
                    <div key={mentee.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                            <AvatarFallback className="text-white bg-gradient-to-br from-blue-500 to-indigo-600">
                              {mentee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-800">{mentee.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">Active {mentee.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={mentee.progress} className="h-2" style={{backgroundColor: "#e2e8f0"}}>
                          <div className={`h-full ${mentee.color} rounded-full`} style={{width: `${mentee.progress}%`}} />
                        </Progress>
                        <span className="text-sm font-medium">{mentee.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SidebarItem = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between w-full px-2 py-2 rounded-md transition-colors ${
      active ? 'bg-gradient-to-r from-blue-800 to-indigo-800 text-blue-200' : 'text-slate-300 hover:bg-blue-800 hover:bg-opacity-50'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    {badge && (
      <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">{badge}</Badge>
    )}
  </button>
);

const StatCard = ({ title, value, icon, change, color, iconBg }) => (
  <Card className="border-none overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="p-0">
      <div className={`bg-gradient-to-r ${color} text-white p-6`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white text-opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change && <p className="text-sm mt-1">{change}</p>}
          </div>
          <div className={`p-2 ${iconBg} bg-opacity-70 rounded-full`}>
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MentorDashboard;
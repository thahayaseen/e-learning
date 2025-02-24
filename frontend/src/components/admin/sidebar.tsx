'use client'
import React, { useState } from 'react';
import {clearGs} from '@/lib/auth'
import {
  Users,
  Shield,
  Settings,
  BarChart3,
  Mail,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  Home
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { delete_cookie } from '@/lib/features/cookie';

const Sidebar = ({Content,path}:{Content?:React.ReactNode,path:React.ReactNode}) => {

  const router=useRouter()
  const [expanded, setExpanded] = useState(true);
const dispatch=useDispatch()
  const menuItems = [
    { icon: Home, label: 'Dashboard', badge: null,path:'/admin' },
    { icon: Users, label: 'User Management', badge: '12',path:'/admin/user' },
    { icon: Shield, label: 'Roles & Permissions', badge: null },
    { icon: BarChart3, label: 'Analytics', badge: null },
    { icon: Mail, label: 'Messages', badge: '5' },
    { icon: Bell, label: 'Notifications', badge: '3' },
    { icon: Settings, label: 'Settings', badge: null },
  ];


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div 
        className={`${
          expanded ? 'w-64' : 'w-16'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-blue-800`}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-800 flex items-center justify-between">
          {expanded && (
            <span className="text-xl font-bold text-blue-400">AdminPanel</span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 transition-colors"
          >
            {expanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4  space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`
                flex items-center w-full p-3 rounded-lg
                hover:bg-blue-900 transition-colors
                ${path==item.label ? 'bg-blue-900 text-blue-100' : 'text-blue-300'}
              `}
              onClick={()=>router.push(item.path)}
            >
              <item.icon size={20} className="min-w-[20px]" />
              {expanded && (
                <>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-700 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-800">
          <button onClick={()=>{
            clearGs(dispatch)
            delete_cookie('access')
             router.push('/auth')}
          }
            className="flex items-center w-full p-3 rounded-lg
              text-red-400 hover:bg-blue-900 transition-colors"
          >
            <LogOut size={20} className="min-w-[20px]" />
            {expanded && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900">
  
        {Content?Content:<h2>haloo</h2>}
      </div>
    </div>
    
  );
};

export default Sidebar;
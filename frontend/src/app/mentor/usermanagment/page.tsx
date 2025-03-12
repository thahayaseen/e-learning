"use client"
import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, PieChart, BookOpen, Clock, Award, Users, ChevronDown } from 'lucide-react';

// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// This component could be connected to your actual data source
const UserManagementDashboard = () => {
  // Sample data based on your schema
  const [users, setUsers] = useState([
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      verified: true,
      isBlocked: false,
      role: 'student',
      purchasedCourses: ['course1', 'course2'],
      profile: {
        avatar: '/api/placeholder/40/40',
        experience: 250,
        social_link: 'linkedin.com/in/johndoe'
      },
      progress: [
        {
          _id: 'prog1',
          Student_id: '1',
          Course_id: {
            _id: 'course1',
            Title: 'React Fundamentals'
          },
          lesson_progress: [
            { Completed: true, Lesson_id: 'lesson1', WatchTime: 45 },
            { Completed: true, Lesson_id: 'lesson2', WatchTime: 30 },
            { Completed: false, Lesson_id: 'lesson3', WatchTime: 15 }
          ],
          Score: 85
        },
        {
          _id: 'prog2',
          Student_id: '1',
          Course_id: {
            _id: 'course2',
            Title: 'Advanced JavaScript'
          },
          lesson_progress: [
            { Completed: true, Lesson_id: 'lesson1', WatchTime: 60 },
            { Completed: false, Lesson_id: 'lesson2', WatchTime: 10 }
          ],
          Score: 70
        }
      ]
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      verified: true,
      isBlocked: false,
      role: 'student',
      purchasedCourses: ['course1'],
      profile: {
        avatar: '/api/placeholder/40/40',
        experience: 120,
        social_link: 'linkedin.com/in/janesmith'
      },
      progress: [
        {
          _id: 'prog3',
          Student_id: '2',
          Course_id: {
            _id: 'course1',
            Title: 'React Fundamentals'
          },
          lesson_progress: [
            { Completed: true, Lesson_id: 'lesson1', WatchTime: 50 },
            { Completed: false, Lesson_id: 'lesson2', WatchTime: 5 }
          ],
          Score: 60
        }
      ]
    },
    {
      _id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      verified: true,
      isBlocked: false,
      role: 'student',
      purchasedCourses: ['course2', 'course3'],
      profile: {
        avatar: '/api/placeholder/40/40',
        experience: 320,
        social_link: 'linkedin.com/in/mikejohnson'
      },
      progress: [
        {
          _id: 'prog4',
          Student_id: '3',
          Course_id: {
            _id: 'course2',
            Title: 'Advanced JavaScript'
          },
          lesson_progress: [
            { Completed: true, Lesson_id: 'lesson1', WatchTime: 60 },
            { Completed: true, Lesson_id: 'lesson2', WatchTime: 45 },
            { Completed: true, Lesson_id: 'lesson3', WatchTime: 55 }
          ],
          Score: 92
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Sort users 
  const sortUsers = (field:string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort users based on current settings
  const filteredUsers = users
    .filter(user => 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === 'all' || user.role === filterRole)
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'experience') {
        return sortDirection === 'asc' 
          ? a.profile.experience - b.profile.experience 
          : b.profile.experience - a.profile.experience;
      } else if (sortField === 'courses') {
        return sortDirection === 'asc' 
          ? a.purchasedCourses.length - b.purchasedCourses.length 
          : b.purchasedCourses.length - a.purchasedCourses.length;
      } else if (sortField === 'score') {
        const aScore = a.progress.length ? a.progress.reduce((acc, curr) => acc + curr.Score, 0) / a.progress.length : 0;
        const bScore = b.progress.length ? b.progress.reduce((acc, curr) => acc + curr.Score, 0) / b.progress.length : 0;
        return sortDirection === 'asc' ? aScore - bScore : bScore - aScore;
      }
      return 0;
    });

  // Calculate user stats 
  const calculateUserStats = (user) => {
    const totalCourses = user.purchasedCourses.length;
    const totalLessons = user.progress.reduce((acc, course) => acc + course.lesson_progress.length, 0);
    const completedLessons = user.progress.reduce((acc, course) => 
      acc + course.lesson_progress.filter(lesson => lesson.Completed).length, 0);
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const totalWatchTime = user.progress.reduce((acc, course) => 
      acc + course.lesson_progress.reduce((sum, lesson) => sum + (lesson.WatchTime || 0), 0), 0);
    const avgScore = user.progress.length > 0 
      ? Math.round(user.progress.reduce((acc, curr) => acc + curr.Score, 0) / user.progress.length) 
      : 0;

    return { totalCourses, totalLessons, completedLessons, completionRate, totalWatchTime, avgScore };
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full w-screen bg-background text-foreground">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center"> 
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Monitor student performance and progress</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {filteredUsers.length} Users
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select 
            value={filterRole}
            onValueChange={setFilterRole}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="mentor">Mentors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Users list */}
        <div className="w-full md:w-2/3 overflow-auto border-r border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center hover:bg-blue-800 px-2 space-x-1  font-medium"
                    onClick={() => sortUsers('name')}
                  >
                    <span>User</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center hover:bg-blue-800 px-2 space-x-1  font-medium"

                    onClick={() => sortUsers('experience')}
                  >
                    <span>Experience</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center hover:bg-blue-800 px-2 space-x-1  font-medium"

                    onClick={() => sortUsers('courses')}
                  >
                    <span>Courses</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center hover:bg-blue-800 px-2 space-x-1  font-medium"

                    onClick={() => sortUsers('score')}
                  >
                    <span>Avg Score</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow 
                  key={user._id} 
                  className={`hover:bg-muted cursor-pointer ${selectedUser && selectedUser._id === user._id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="mr-3">
                        <AvatarImage src={user.profile.avatar} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.profile.experience} XP</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.purchasedCourses.length}</div>
                  </TableCell>
                  <TableCell>
                    {user.progress.length > 0 ? (
                      <div className="font-medium">
                        {Math.round(user.progress.reduce((acc, curr) => acc + curr.Score, 0) / user.progress.length)}%
                      </div>
                    ) : (
                      <div className="text-muted-foreground">N/A</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        {user.isBlocked ? (
                          <DropdownMenuItem className="text-green-500">Unblock User</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-red-500">Block User</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* User details panel */}
        <div className="w-full md:w-1/3 overflow-auto">
          {selectedUser ? (
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={selectedUser.profile.avatar} />
                  <AvatarFallback className="text-xl">{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex mt-2 space-x-2">
                    <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 
                              (selectedUser.role === 'mentor' ? 'default' : 'secondary')}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                    {selectedUser.verified && (
                      <Badge variant="outline" className="bg-green-950/20 text-green-400 border-green-800">
                        Verified
                      </Badge>
                    )}
                    {selectedUser.isBlocked && (
                      <Badge variant="destructive">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="courses" className="flex-1">Courses</TabsTrigger>
                  <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  {/* Performance metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(() => {
                      const stats = calculateUserStats(selectedUser);
                      return (
                        <>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-blue-500/20 text-blue-500 mr-4">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Courses</p>
                                  <p className="text-2xl font-semibold">{stats.totalCourses}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-green-500/20 text-green-500 mr-4">
                                  <PieChart className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Completion</p>
                                  <p className="text-2xl font-semibold">{stats.completionRate}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-amber-500/20 text-amber-500 mr-4">
                                  <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Watch Time</p>
                                  <p className="text-2xl font-semibold">{stats.totalWatchTime} min</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-purple-500/20 text-purple-500 mr-4">
                                  <Award className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Avg Score</p>
                                  <p className="text-2xl font-semibold">{stats.avgScore}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </div>

                  {/* Recent progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedUser.progress.slice(0, 1).map(progress => (
                          <div key={progress._id}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{progress.Course_id.Title}</h4>
                              <Badge>{progress.Score}%</Badge>
                            </div>
                            
                            <Progress value={progress.Score} className="h-2 mb-3" />
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              {progress.lesson_progress.filter(lesson => lesson.Completed).length} of {progress.lesson_progress.length} lessons completed
                            </div>
                            
                            <div className="space-y-2">
                              {progress.lesson_progress.map((lesson, index) => (
                                <div key={lesson.Lesson_id} className="flex items-center text-sm py-1 border-b border-border pb-2 last:border-0">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${lesson.Completed ? 'bg-green-500' : 'bg-muted'}`}></div>
                                  <span className="flex-1">Lesson {index + 1}</span>
                                  <span className="text-muted-foreground">{lesson.WatchTime} min</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="courses">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedUser.progress.map(progress => (
                          <div key={progress._id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{progress.Course_id.Title}</h4>
                              <Badge variant={
                                progress.Score >= 80 ? "success" : 
                                progress.Score >= 60 ? "default" : "outline"
                              }>
                                {progress.Score}%
                              </Badge>
                            </div>
                            
                            <Progress 
                              value={progress.Score} 
                              className="h-2 mb-3" 
                            />
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {progress.lesson_progress.filter(lesson => lesson.Completed).length} of {progress.lesson_progress.length} lessons completed
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              {progress.lesson_progress.map((lesson, index) => (
                                <div key={lesson.Lesson_id} className="flex items-center text-sm py-1 border-b border-border last:border-0 last:pb-0 pb-2">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${lesson.Completed ? 'bg-green-500' : 'bg-muted'}`}></div>
                                  <span className="flex-1">Lesson {index + 1}</span>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span className="text-muted-foreground">{lesson.WatchTime} min</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const stats = calculateUserStats(selectedUser);
                        return (
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between mb-2">
                                <h4 className="text-sm font-medium">Overall Completion Rate</h4>
                                <span className="text-sm font-medium">{stats.completionRate}%</span>
                              </div>
                              <Progress value={stats.completionRate} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <h4 className="text-sm font-medium">Average Score</h4>
                                <span className="text-sm font-medium">{stats.avgScore}%</span>
                              </div>
                              <Progress value={stats.avgScore} className="h-2" />
                            </div>
                            
                            <div className="pt-4 border-t border-border">
                              <h4 className="text-sm font-medium mb-4">Completion Details</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                  <span className="text-3xl font-bold">{stats.completedLessons}</span>
                                  <span className="text-sm text-muted-foreground">Lessons Completed</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-3xl font-bold">{stats.totalLessons - stats.completedLessons}</span>
                                  <span className="text-sm text-muted-foreground">Lessons Remaining</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-3xl font-bold">{stats.totalWatchTime}</span>
                                  <span className="text-sm text-muted-foreground">Minutes Watched</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-3xl font-bold">{stats.totalCourses}</span>
                                  <span className="text-sm text-muted-foreground">Courses Enrolled</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <PieChart className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No User Selected</h3>
              <p>Select a user from the list to view detailed information and performance metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementDashboard;
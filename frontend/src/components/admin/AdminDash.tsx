"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Award,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  mentorRevenueRes,
  ordersRes,
  timeRevenueRes,
  totalRevenueRes,
} from "@/services/fetchdata";

const AdminDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState({
    mentorRevenue: [],
    timeRevenue: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    totalRevenue: 0,
    orders: [],
    totalPages: 1,
  });
  const [loading, setLoading] = useState({
    initial: true,
    timeRevenue: false,
    orders: false,
  });
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoverMentor, setHoverMentor] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  // Fetch initial dashboard data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        // Fetch data in parallel
        const [totalRevenueData, mentorRevenueData, monthlyRevenueData] =
          await Promise.all([
            totalRevenueRes(),
            mentorRevenueRes(),
            timeRevenueRes("monthly"),
          ]);

        setDashboardData((prev) => ({
          ...prev,
          totalRevenue: totalRevenueData.totalRevenue,
          mentorRevenue: mentorRevenueData.mentorRevenue,
          timeRevenue: {
            ...prev.timeRevenue,
            monthly: monthlyRevenueData.timeRevenue,
          },
        }));

        // Fetch orders separately
        fetchOrders(1);
      } catch (error) {
        console.error("Error fetching initial dashboard data:", error);
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };

    fetchInitialData();
  }, []);

  // Fetch time-based revenue when timePeriod changes
  useEffect(() => {
    const fetchTimeRevenue = async () => {
      // If we already have data for this period, don't fetch it again
      if (dashboardData.timeRevenue[timePeriod].length > 0) return;

      setLoading((prev) => ({ ...prev, timeRevenue: true }));
      try {
        const timeRevenueData = await timeRevenueRes(timePeriod);

        setDashboardData((prev) => ({
          ...prev,
          timeRevenue: {
            ...prev.timeRevenue,
            [timePeriod]: timeRevenueData.timeRevenue,
          },
        }));
      } catch (error) {
        console.error(`Error fetching ${timePeriod} revenue data:`, error);
      } finally {
        setLoading((prev) => ({ ...prev, timeRevenue: false }));
      }
    };

    fetchTimeRevenue();
  }, [timePeriod]);

  // Fetch orders when page changes
  const fetchOrders = async (page) => {
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
      const limit=3
      const ordersData = await ordersRes(page,limit);
      console.log(ordersData, "orderdatais ");
      setDashboardData((prev) => ({
        ...prev,
        orders: ordersData.result.orders,
        totalPages: Math.ceil( Number(ordersData.result.totalOrders)/limit),
      }));
      setTotalOrders(ordersData.result.totalOrders);
      console.log(dashboardData, "dashbord data");
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const calculateGrowth = () => {
    const currentTimeRevenue = dashboardData.timeRevenue[timePeriod];

    if (!currentTimeRevenue || currentTimeRevenue.length < 2) {
      return { percentage: 0, isPositive: true };
    }

    const currentRevenue =
      currentTimeRevenue[currentTimeRevenue.length - 1].revenue;
    const previousRevenue =
      currentTimeRevenue[currentTimeRevenue.length - 2].revenue;

    const diff = currentRevenue - previousRevenue;
    const percentage =
      previousRevenue !== 0 ? (diff / previousRevenue) * 100 : 0;

    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: diff >= 0,
    };
  };

  const growth = calculateGrowth();

  // Chart theme configuration
  const chartTheme = {
    colors: {
      primary: "#4f46e5", // Indigo
      secondary: "#3b82f6", // Blue
      accent: "#8b5cf6", // Purple
      success: "#10b981", // Green
      warning: "#f59e0b", // Amber
      danger: "#ef4444", // Red
      background: "#111827", // Dark background
      card: "#1f2937", // Card background
      border: "#374151", // Border color
      text: "#e5e7eb", // Text color
      grid: "#374151", // Grid lines
    },
    gradients: {
      revenue: [
        { offset: "0%", color: "rgba(79, 70, 229, 0.8)" },
        { offset: "100%", color: "rgba(79, 70, 229, 0.1)" },
      ],
      mentor: [
        { offset: "0%", color: "#4f46e5" },
        { offset: "100%", color: "#8b5cf6" },
      ],
    },
  };

  // Current time revenue data based on selected period
  const currentTimeRevenueData = useMemo(() => {
    return dashboardData.timeRevenue[timePeriod] || [];
  }, [dashboardData.timeRevenue, timePeriod]);

  // Top mentors for display
  const topMentors = useMemo(() => {
    return [...dashboardData.mentorRevenue]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [dashboardData.mentorRevenue]);

  // Loading skeleton components
  const StatSkeleton = () => (
    <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 animate-pulse">
      <div className="flex items-center">
        <div className="bg-gray-700 p-3 rounded-full h-10 w-10"></div>
        <div className="ml-4 w-full">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700 animate-pulse">
      <div className="p-4 border-b border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="p-4">
        <div className="h-80 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700 animate-pulse">
      <div className="p-4 border-b border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="p-4">
        <div className="h-8 bg-gray-700 rounded w-full mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700 rounded w-full mb-2"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 pb-8">
      {/* Header with subtle gradient */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <DollarSign className="mr-2 text-indigo-400" />
            Mentor Revenue Dashboard
          </h1>
          <p className="text-gray-300 mt-1">
            Monitor financial performance and mentor activity
          </p>
        </div>
      </div>

      {loading.initial ? (
        <div className="container mx-auto px-4 py-6">
          {/* Skeleton loading state */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
            <ChartSkeleton />
            <TableSkeleton />
          </div>
          <TableSkeleton />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          {/* Summary Stats with improved visuals */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl">
              <div className="flex items-center">
                <div className="bg-indigo-900 p-3 rounded-full">
                  <DollarSign className="text-indigo-400" size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-400">
                    Total Revenue
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(dashboardData.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl">
              <div className="flex items-center">
                <div className="bg-indigo-900 p-3 rounded-full">
                  <DollarSign className="text-indigo-400" size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-400">
                    Total Gained
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency((dashboardData.totalRevenue*.1))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl">
              <div className="flex items-center">
                <div
                  className={`${
                    growth.isPositive ? "bg-green-900" : "bg-red-900"
                  } p-3 rounded-full`}>
                  {growth.isPositive ? (
                    <TrendingUp className="text-green-400" size={24} />
                  ) : (
                    <ArrowDown className="text-red-400" size={24} />
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-400">
                    {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}{" "}
                    Growth
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {growth.percentage}%
                    <span
                      className={
                        growth.isPositive ? "text-green-400" : "text-red-400"
                      }>
                      {growth.isPositive ? " ↑" : " ↓"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl">
              <div className="flex items-center">
                <div className="bg-purple-900 p-3 rounded-full">
                  <Users className="text-purple-400" size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-400">
                    Total Mentors
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.mentorRevenue.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Active contributors
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl">
              <div className="flex items-center">
                <div className="bg-blue-900 p-3 rounded-full">
                  <BookOpen className="text-blue-400" size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-400">
                    Total Orders
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {/* {JSON.stringify(dashboardData)} */}
                    {totalOrders > 0
                      ? totalOrders
                      : 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Completed transactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Period Selection with improved UI */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg mb-6 border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white flex items-center">
                <Calendar className="mr-2 text-blue-400" size={18} />
                Revenue Over Time
              </h2>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
                    timePeriod === "daily"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setTimePeriod("daily")}>
                  <Clock size={14} className="mr-1" />
                  Daily
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
                    timePeriod === "weekly"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setTimePeriod("weekly")}>
                  <Calendar size={14} className="mr-1" />
                  Weekly
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
                    timePeriod === "monthly"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setTimePeriod("monthly")}>
                  <Calendar size={14} className="mr-1" />
                  Monthly
                </button>
              </div>
            </div>

            {/* Time Revenue Chart with loading state */}
            <div className="p-4">
              {loading.timeRevenue ? (
                <div className="h-80 flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    <RefreshCw
                      className="animate-spin text-blue-500 mb-2"
                      size={32}
                    />
                    <p className="text-gray-400">
                      Loading {timePeriod} data...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentTimeRevenueData}>
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          {chartTheme.gradients.revenue.map((stop, index) => (
                            <stop
                              key={index}
                              offset={stop.offset}
                              stopColor={stop.color}
                            />
                          ))}
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartTheme.colors.grid}
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="_id"
                        tick={{ fill: chartTheme.colors.text }}
                        stroke={chartTheme.colors.grid}
                      />
                      <YAxis
                        tick={{ fill: chartTheme.colors.text }}
                        stroke={chartTheme.colors.grid}
                      />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{
                          backgroundColor: chartTheme.colors.card,
                          border: `1px solid ${chartTheme.colors.border}`,
                          color: chartTheme.colors.text,
                          borderRadius: "4px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={chartTheme.colors.primary}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                        activeDot={{
                          r: 6,
                          fill: chartTheme.colors.primary,
                          stroke: chartTheme.colors.text,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Mentor Revenue and Top Mentors with improved visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center">
                <Award className="mr-2 text-purple-400" size={18} />
                <h2 className="text-lg font-medium text-white">
                  Mentor Revenue
                </h2>
              </div>
              <div className="p-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData.mentorRevenue.slice(0, 10)}
                      onMouseMove={(data) => {
                        if (data && data.activeTooltipIndex !== undefined) {
                          setHoverMentor(data.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoverMentor(null)}>
                      <defs>
                        <linearGradient
                          id="mentorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          {chartTheme.gradients.mentor.map((stop, index) => (
                            <stop
                              key={index}
                              offset={stop.offset}
                              stopColor={stop.color}
                            />
                          ))}
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartTheme.colors.grid}
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="mentorName"
                        tick={{ fill: chartTheme.colors.text }}
                        stroke={chartTheme.colors.grid}
                      />
                      <YAxis
                        tick={{ fill: chartTheme.colors.text }}
                        stroke={chartTheme.colors.grid}
                      />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: chartTheme.colors.card,
                          border: `1px solid ${chartTheme.colors.border}`,
                          color: chartTheme.colors.text,
                          borderRadius: "4px",
                        }}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        fill="url(#mentorGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Mentors Table with improved visuals */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center">
                <Users className="mr-2 text-blue-400" size={18} />
                <h2 className="text-lg font-medium text-white">
                  Top Performing Mentors
                </h2>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Mentor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {topMentors.map((mentor, index) => (
                      <tr
                        key={mentor._id}
                        className={`transition-colors ${
                          hoverMentor === index
                            ? "bg-gray-700"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white flex items-center">
                            {index < 3 && (
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${
                                  index === 0
                                    ? "bg-yellow-500"
                                    : index === 1
                                    ? "bg-gray-400"
                                    : "bg-yellow-700"
                                }`}>
                                {index + 1}
                              </span>
                            )}
                            {mentor.mentorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {mentor.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-indigo-400">
                            {formatCurrency(mentor.totalRevenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Orders with improved visuals */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center">
              <BookOpen className="mr-2 text-green-400" size={18} />
              <h2 className="text-lg font-medium text-white">Recent Orders</h2>
            </div>

            {loading.orders ? (
              <div className="p-8 flex justify-center">
                <div className="flex flex-col items-center">
                  <RefreshCw
                    className="animate-spin text-blue-500 mb-2"
                    size={32}
                  />
                  <p className="text-gray-400">Loading orders...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {dashboardData.orders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {order._id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-white">
                              {order.userId?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {order.userId?.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {order.courseId?.Title || "Unknown Course"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-400">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-900 text-green-300"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-900 text-yellow-300"
                                  : "bg-red-900 text-red-300"
                              }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination with improved styling */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing page{" "}
                      <span className="font-medium text-white">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-white">
                        {dashboardData.totalPages}
                      </span>
                    </p>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, dashboardData.totalPages)
                        )
                      }
                      disabled={currentPage === dashboardData.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

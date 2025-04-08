"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getordersMentor,
  revenueMentor,
  statesMentor,
} from "@/services/fetchdata";

// Dashboard component
const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  // Recent orders pagination
  const [recentPage, setRecentPage] = useState(1);
  const [recentPageSize, setRecentPageSize] = useState(5);

  // Enhanced color scheme for a dark blue theme
  const THEME_COLORS = {
    primary: "#0a192f", // Dark blue background
    secondary: "#172a45", // Slightly lighter blue for cards
    accent: "#64ffda", // Teal accent color
    text: "#e6f1ff", // Light blue-ish white text
    textDim: "#8892b0", // Dimmed text
    chartColors: ["#64ffda", "#00bcd4", "#3498db", "#5e72e4"], // Teals and blues
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
  };

  // Fetch orders with pagination
  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const ordersResponse = await getordersMentor(page, limit);
      console.log(ordersResponse, "mentorside order");

      setOrders(ordersResponse.data.orders);
      setTotalPages(ordersResponse.data.totalPages || 1);
      setTotalOrders(ordersResponse.data.totalOrders || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch orders with pagination
        await fetchOrders(currentPage, pageSize);

        // Fetch stats
        const statsResponse = await statesMentor();
        console.log(statsResponse, "resp is ");
        setStats(statsResponse.data.stats);

        // Fetch revenue data for chart
        const revenueResponse = await revenueMentor();
        console.log('revenue ius ',revenueResponse);
        
        setRevenueData(revenueResponse.data.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentPage, pageSize]);

  // Recent orders function
  const fetchRecentOrders = async (page = 1, limit = 5) => {
    try {
      const recentOrdersResponse = await getordersMentor(page, limit, "date");
      if (stats) {
        const updatedStats = {
          ...stats,
          recentSales: recentOrdersResponse.data.orders,
        };
        setStats(updatedStats);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  // Update orders when active tab changes to orders
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders(currentPage, pageSize);
    } else if (activeTab === "overview" && stats) {
      fetchRecentOrders(recentPage, recentPageSize);
    }
  }, [activeTab, currentPage, pageSize, recentPage, recentPageSize]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle recent page change
  const handleRecentPageChange = (newPage) => {
    setRecentPage(newPage);
    fetchRecentOrders(newPage, recentPageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Prepare data for pie chart
  const preparePaymentStatusData = () => {
    if (!stats) return [];

    return [
      { name: "Paid", value: stats.paidOrders },
      { name: "Pending", value: stats.pendingOrders },
      { name: "Failed", value: stats.failedOrders },
    ];
  };

  // Pagination component
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    align = "center",
  }) => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={`flex items-center space-x-1 justify-${align} mt-4`}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded transition-colors duration-200"
          style={{
            backgroundColor:
              currentPage === 1
                ? `${THEME_COLORS.secondary}80`
                : THEME_COLORS.secondary,
            color: currentPage === 1 ? THEME_COLORS.textDim : THEME_COLORS.text,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}>
          &laquo;
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded transition-colors duration-200"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              1
            </button>
            {startPage > 2 && (
              <span style={{ color: THEME_COLORS.textDim }}>...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="px-3 py-1 rounded transition-colors duration-200"
            style={{
              backgroundColor:
                currentPage === page
                  ? THEME_COLORS.accent
                  : THEME_COLORS.secondary,
              color:
                currentPage === page ? THEME_COLORS.primary : THEME_COLORS.text,
            }}>
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span style={{ color: THEME_COLORS.textDim }}>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded transition-colors duration-200"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded transition-colors duration-200"
          style={{
            backgroundColor:
              currentPage === totalPages
                ? `${THEME_COLORS.secondary}80`
                : THEME_COLORS.secondary,
            color:
              currentPage === totalPages
                ? THEME_COLORS.textDim
                : THEME_COLORS.text,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}>
          &raquo;
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="flex w-screen items-center justify-center h-screen"
        style={{ backgroundColor: THEME_COLORS.primary }}>
        <div
          className="text-2xl font-semibold"
          style={{ color: THEME_COLORS.accent }}>
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 w-screen min-h-screen"
      style={{ backgroundColor: THEME_COLORS.primary }}>
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: THEME_COLORS.text }}>
        Mentor Dashboard
      </h1>

      {/* Navigation Tabs */}
      <div
        className="flex mb-6 rounded-lg shadow overflow-hidden"
        style={{ backgroundColor: THEME_COLORS.secondary }}>
        <button
          className="px-6 py-3 font-medium transition-all duration-200"
          style={{
            backgroundColor:
              activeTab === "overview" ? THEME_COLORS.accent : "transparent",
            color:
              activeTab === "overview"
                ? THEME_COLORS.primary
                : THEME_COLORS.text,
          }}
          onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button
          className="px-6 py-3 font-medium transition-all duration-200"
          style={{
            backgroundColor:
              activeTab === "orders" ? THEME_COLORS.accent : "transparent",
            color:
              activeTab === "orders" ? THEME_COLORS.primary : THEME_COLORS.text,
          }}
          onClick={() => setActiveTab("orders")}>
          Orders
        </button>
        <button
          className="px-6 py-3 font-medium transition-all duration-200"
          style={{
            backgroundColor:
              activeTab === "revenue" ? THEME_COLORS.accent : "transparent",
            color:
              activeTab === "revenue"
                ? THEME_COLORS.primary
                : THEME_COLORS.text,
          }}
          onClick={() => setActiveTab("revenue")}>
          Revenue
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Total Orders
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Total Revenue (without platform ffee)
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                ₹{stats?.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Paid Orders
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                {stats?.paidOrders || 0}
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.secondary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Pending Orders
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                {stats?.pendingOrders || 0}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div
              className="p-6 rounded-lg shadow"
              style={{ backgroundColor: THEME_COLORS.secondary }}>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: THEME_COLORS.text }}>
                Monthly Revenue
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={`${THEME_COLORS.textDim}40`}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: THEME_COLORS.textDim }}
                    />
                    <YAxis tick={{ fill: THEME_COLORS.textDim }} />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: THEME_COLORS.primary,
                        borderColor: THEME_COLORS.accent,
                      }}
                      labelStyle={{ color: THEME_COLORS.text }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={THEME_COLORS.accent}
                      strokeWidth={3}
                      dot={{
                        stroke: THEME_COLORS.accent,
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        stroke: THEME_COLORS.accent,
                        strokeWidth: 2,
                        r: 8,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Status Chart */}
            <div
              className="p-6 rounded-lg shadow"
              style={{ backgroundColor: THEME_COLORS.secondary }}>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: THEME_COLORS.text }}>
                Payment Status
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePaymentStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }>
                      {preparePaymentStatusData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            THEME_COLORS.chartColors[
                              index % THEME_COLORS.chartColors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Orders"]}
                      contentStyle={{
                        backgroundColor: THEME_COLORS.primary,
                        borderColor: THEME_COLORS.accent,
                      }}
                      labelStyle={{ color: THEME_COLORS.text }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: THEME_COLORS.text }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Sales with Pagination */}
          <div
            className="p-6 rounded-lg shadow"
            style={{ backgroundColor: THEME_COLORS.secondary }}>
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: THEME_COLORS.text }}>
                Recent Sales
              </h3>
              <div className="flex items-center space-x-2">
                <label style={{ color: THEME_COLORS.textDim }}>Show:</label>
                <select
                  value={recentPageSize}
                  onChange={(e) => {
                    setRecentPageSize(parseInt(e.target.value));
                    setRecentPage(1);
                    fetchRecentOrders(1, parseInt(e.target.value));
                  }}
                  className="py-1 px-2 rounded"
                  style={{
                    backgroundColor: THEME_COLORS.primary,
                    color: THEME_COLORS.text,
                    border: `1px solid ${THEME_COLORS.textDim}40`,
                  }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y"
                style={{ borderColor: `${THEME_COLORS.textDim}40` }}>
                <thead>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Date
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Course
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Student
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Amount
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: `${THEME_COLORS.textDim}20` }}>
                  {stats?.recentSales?.map((sale) => (
                    <tr
                      key={sale._id}
                      className="hover:bg-opacity-10 hover:bg-white">
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        style={{ color: THEME_COLORS.accent }}>
                        {sale.courseId?.Title || "Unknown Course"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        {sale.userId?.name || "Unknown User"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        ₹{sale.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{
                            backgroundColor:
                              sale.paymentStatus === "paid"
                                ? `${THEME_COLORS.success}30`
                                : sale.paymentStatus === "pending"
                                ? `${THEME_COLORS.warning}30`
                                : `${THEME_COLORS.danger}30`,
                            color:
                              sale.paymentStatus === "paid"
                                ? THEME_COLORS.success
                                : sale.paymentStatus === "pending"
                                ? THEME_COLORS.warning
                                : THEME_COLORS.danger,
                          }}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        {sale.planType}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentSales || stats.recentSales.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm"
                        style={{ color: THEME_COLORS.textDim }}>
                        No recent sales found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for recent sales */}
            {stats?.recentSales && stats.recentSales.length > 0 && (
              <Pagination
                currentPage={recentPage}
                totalPages={Math.ceil(totalOrders / recentPageSize) || 1}
                onPageChange={handleRecentPageChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div
          className="p-6 rounded-lg shadow"
          style={{ backgroundColor: THEME_COLORS.secondary }}>
          <div className="flex justify-between items-center mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: THEME_COLORS.text }}>
              All Orders
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label style={{ color: THEME_COLORS.textDim }}>Show:</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="py-1 px-2 rounded"
                  style={{
                    backgroundColor: THEME_COLORS.primary,
                    color: THEME_COLORS.text,
                    border: `1px solid ${THEME_COLORS.textDim}40`,
                  }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            
            </div>
          </div>

          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y"
              style={{ borderColor: `${THEME_COLORS.textDim}40` }}>
              <thead>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Order ID
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Date
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Course
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Student
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Amount
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: THEME_COLORS.textDim }}>
                    Plan
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: `${THEME_COLORS.textDim}20` }}>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-opacity-10 hover:bg-white transition-colors duration-150">
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: THEME_COLORS.text }}>
                      {order._id.substring(0, 8)}...
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: THEME_COLORS.text }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      style={{ color: THEME_COLORS.accent }}>
                      {order.courseId?.Title || "Unknown Course"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: THEME_COLORS.text }}>
                      {order.userId?.name || "Unknown User"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: THEME_COLORS.text }}>
                      ₹{order.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            order.paymentStatus === "paid"
                              ? `${THEME_COLORS.success}30`
                              : order.paymentStatus === "pending"
                              ? `${THEME_COLORS.warning}30`
                              : `${THEME_COLORS.danger}30`,
                          color:
                            order.paymentStatus === "paid"
                              ? THEME_COLORS.success
                              : order.paymentStatus === "pending"
                              ? THEME_COLORS.warning
                              : THEME_COLORS.danger,
                        }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: THEME_COLORS.text }}>
                      {order.planType}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-sm"
                      style={{ color: THEME_COLORS.textDim }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for orders */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div
          className="p-6 rounded-lg shadow"
          style={{ backgroundColor: THEME_COLORS.secondary }}>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: THEME_COLORS.text }}>
            Revenue Analytics
          </h2>

          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.primary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Total Revenue
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                ₹{stats?.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.primary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Avg. Order Value
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                ₹
                {stats?.totalOrders
                  ? Math.round(
                      stats.totalRevenue / stats.totalOrders
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow transition-transform duration-300 hover:transform hover:scale-105"
              style={{
                backgroundColor: THEME_COLORS.primary,
                color: THEME_COLORS.text,
              }}>
              <h3
                className="text-sm font-medium mb-1"
                style={{ color: THEME_COLORS.textDim }}>
                Revenue Growth
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: THEME_COLORS.accent }}>
                {revenueData.length > 1
                  ? `${Math.round(
                      ((revenueData[revenueData.length - 1]?.revenue || 0) /
                        (revenueData[revenueData.length - 2]?.revenue || 1) -
                        1) *
                        100
                    )}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: THEME_COLORS.text }}>
              Monthly Revenue Trend
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={`${THEME_COLORS.textDim}40`}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: THEME_COLORS.textDim }}
                  />
                  <YAxis
                    tick={{ fill: THEME_COLORS.textDim }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: THEME_COLORS.primary,
                      borderColor: THEME_COLORS.accent,
                    }}
                    labelStyle={{ color: THEME_COLORS.text }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={THEME_COLORS.accent}
                    strokeWidth={3}
                    dot={{
                      stroke: THEME_COLORS.accent,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      stroke: THEME_COLORS.accent,
                      strokeWidth: 2,
                      r: 8,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Course */}
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: THEME_COLORS.text }}>
              Revenue by Course
            </h3>
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y"
                style={{ borderColor: `${THEME_COLORS.textDim}40` }}>
                <thead>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Course
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Orders
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Revenue
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME_COLORS.textDim }}>
                      Avg. Price
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  
                  style={{ borderColor: `${THEME_COLORS.textDim}20` }}>
                  {stats?.courseRevenue?.filter(dat=>dat.Students_enrolled.length>0).map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-opacity-10 hover:bg-white transition-colors duration-150">
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        style={{ color: THEME_COLORS.accent }}>
                        {course.Title || "Unknown Course"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        {course.Students_enrolled.length}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        ₹{course.Price?.toLocaleString()}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: THEME_COLORS.text }}>
                        ₹
                       
                        {Math.round(
                          course.Price / course.Students_enrolled.length
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.courseRevenue ||
                    stats.courseRevenue.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-sm"
                        style={{ color: THEME_COLORS.textDim }}>
                        No course revenue data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;

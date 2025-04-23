"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { Badge } from "../ui/badge";
import type { IOrder } from "./profile-overview"; // Assuming you have this interface defined
import { fetchorders, reorder } from "@/services/fetchdata";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Clock, CreditCard, ShoppingCart, Package } from "lucide-react";
import PaginationComponent from "../default/pagination";

export function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      const data = await fetchorders(currentPage, 10);
      console.log(data, "roddatais ");

      setOrders(data.result.orders);
      setTotalPages(Math.ceil(data.result.totalCount / 10));
      setIsLoading(false);
    };

    loadOrders();
  }, [currentPage]);

  const getPaymentStatusVariant = (status: "pending" | "paid" | "failed") => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusIcon = (status: "pending" | "paid" | "failed") => {
    switch (status) {
      case "paid":
        return <CreditCard className="w-4 h-4 mr-1" />;
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "failed":
        return <ShoppingCart className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-white">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // If no orders
  if (!orders || orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a192f] p-6">
        <div className="text-center space-y-3">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
          <p className="text-white text-lg">No orders found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/courses")}
            className="text-white border-gray-600 hover:bg-gray-800">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex  justify-center min-h-screen bg-[#0a192f] p-6">
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <CardTitle className="text-white font-bold text-xl flex items-center">
            <Package className="mr-2 h-5 w-5 text-primary" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800/50 border-b border-gray-800">
                  <TableHead className="w-16 text-white font-semibold">
                    #
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Course
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Amount
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Payment Status
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow
                    key={order._id}
                    className="hover:bg-gray-800/50 transition-colors border-b border-gray-800">
                    <TableCell className="font-medium text-white">
                      {(currentPage - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {order.courseId.Title}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary-foreground">
                        {order.amount} {order.currency.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.paymentStatus === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary hover:text-white text-white border-primary transition-colors"
                          onClick={async () => {
                            const data = await reorder(order._id);
                            console.log(data, "data is ");

                            router.push(data.url);
                          }}>
                          <Clock className="mr-1 h-4 w-4" /> Complete Payment
                        </Button>
                      ) : (
                        <Badge
                          variant={getPaymentStatusVariant(order.paymentStatus)}
                          className="flex items-center text-white w-fit">
                          {getPaymentStatusIcon(order.paymentStatus)}
                          {order.paymentStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-center">
            <PaginationComponent
              page={currentPage}
              itemsPerPage={10}
              setPage={setCurrentPage}
              total={totalPages}
              // className="text-white" // Add this class to make pagination text white
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

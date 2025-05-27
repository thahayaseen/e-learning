import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "lucide-react";
import UserBlockbtn from "../mybtns/userBlockbtn";
import { Adminshousers } from "@/services/interface/userinterface";
import { ICategory } from "@/services/interface/CourseDto";

// Define a union type for our data
type TableDataType = Adminshousers | ICategory;

// Define column config with render function
interface ColumnConfig<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

interface AdminTableProps<T extends TableDataType> {
  columns: ColumnConfig<T>[];
  data: T[];
  isLoading: boolean;
  toggleBlock?: (id: string, type: boolean) => void;
  emptyMessage?: string;
  loadingMessage?: string;
}

function AdminTable<T extends TableDataType>({
  columns,
  data,
  isLoading,
  toggleBlock,
  emptyMessage = "No data found",
  loadingMessage = "Loading data..."
}: AdminTableProps<T>) {
  // Type guard to check if item is a user
  const isUser = (item: TableDataType): item is Adminshousers => {
    return 'role' in item && 'email' in item;
  };

  return (
    <div className="w-full">
      <Card className="bg-blue-900 border-blue-800  shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-blue-100 flex justify-center items-center">
              <svg
                className="animate-spin h-6 w-6 mr-3 text-blue-300"
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
              {loadingMessage}
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-blue-100">
              {emptyMessage}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-blue-800  hover:bg-blue-800">
                  {columns.map((column, index) => (
                    <TableHead key={index} className="text-white">
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody key={1}>
                {data.map((item,index) => (
                  <TableRow
                    key={index}
                    className={`border-blue-800 ${
                      'blocked' in item && item.blocked ? "bg-blue-800/50" : "bg-blue-900"
                    } hover:bg-blue-800 transition-colors`}>
                    {columns.map((column, index) => (
                      <TableCell key={index} className={index === 0 ? "font-medium text-white" : "text-blue-100"}>
                        {column.render(item as T)}
                      </TableCell>
                    ))}
                 
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminTable;
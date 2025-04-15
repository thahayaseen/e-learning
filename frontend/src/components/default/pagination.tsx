import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { SetStateAction, useCallback } from "react";

interface PaginationComponentProps {
  page: number; // Current page number
  total: number; // Total number of items
  itemsPerPage: number; // Number of items per page
  setPage: React.Dispatch<SetStateAction<number>>;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  page,
  total,
  itemsPerPage,
  setPage,
}) => {
  // Calculate total pages, ensuring minimum of 1 page even when total is 0
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const nextPage = () => {
    console.log("change page", page);
    if (page < totalPages) {

      setPage((prev) => prev + 1);
    }
  }

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page, setPage]);

  return (
    <Pagination className="my-4">
      <PaginationContent className="flex items-center gap-1 bg-gray-800 p-2 rounded-lg shadow-md">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={previousPage}
            aria-label="Go to previous page"
            className={`transition-all duration-200 hover:bg-gray-700 ${
              page === 1
                ? "pointer-events-none opacity-50 text-gray-400"
                : "text-white hover:scale-105"
            }`}
          />
        </PaginationItem>

        {/* Current page */}
        <PaginationItem>
          <PaginationLink
            isActive
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200">
            {page}
          </PaginationLink>
        </PaginationItem>

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={nextPage}
            aria-label="Go to next page"
            className={`transition-all duration-200 hover:bg-gray-700 ${
              page === totalPages
                ? "pointer-events-none opacity-50 text-gray-400"
                : "text-white hover:scale-105"
            }`}
          />
        </PaginationItem>
        <br />

        {/* <div className="text-xs text-gray-400 ml-2 px-3">
          Page {page} of {totalPages}
        </div> */}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;

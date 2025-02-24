import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"; // Adjust the import path as needed
import { SetStateAction, useCallback, useMemo } from "react";

interface PaginationComponentProps {
  page: number; // Current page number
  total: number; // Total number of pages
  setPage: React.Dispatch<SetStateAction<number>>;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  page,
  total,
  setPage,
}) => {
  const nextPage = useCallback(() => {
    console.log(page<total,page,total);
    
    if (page < total) {
      setPage((prev) => prev + 1);
    }
  }, [total, page]);
  const previousPage = useCallback(() => {
    if (1 < page) {
      setPage((prev) => prev - 1);
    }
  }, [page]);
  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={previousPage}
            aria-label="Go to previous page"
            disabled={page === 1} // Disable if on the first page
          />
        </PaginationItem>

        {/* Current Page */}
        <PaginationItem>
          <PaginationLink href="#" isActive>
            {page}
          </PaginationLink>
        </PaginationItem>

        {/* Ellipsis (Optional) */}
        {total > page && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={nextPage}
            aria-label="Go to next page"
            disabled={page === total} // Disable if on the last page
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;

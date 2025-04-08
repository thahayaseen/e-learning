import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
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
  console.log(total);

  const totalPages = Math.ceil(total / itemsPerPage);
  console.log("total pages", totalPages);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [totalPages, page, setPage]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page, setPage]);

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={previousPage}
            aria-label="Go to previous page"
            className={
              page === 1 ? "pointer-events-none opacity-50 text-white" : ""
            }
          />
        </PaginationItem>

        {/* Page Numbers */}
        {totalPages <= 5 ? (
          // Show all pages if total pages are 5 or less
          Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
                className="text-white">
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))
        ) : (
          // Show pagination with ellipsis for more than 5 pages
          <>
            <PaginationItem>
              <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
                1
              </PaginationLink>
            </PaginationItem>

            {/* First ellipsis */}
            {page > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Pages around current page */}
            {page > 2 && page < totalPages && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setPage(page)}
                  isActive
                  className="text-white">
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Second ellipsis */}
            {page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            <PaginationItem>
              <PaginationLink
                isActive={page === totalPages}
                onClick={() => setPage(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={nextPage}
            aria-label="Go to next page"
            className={
              page === totalPages
                ? "pointer-events-none opacity-50 text-white"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;

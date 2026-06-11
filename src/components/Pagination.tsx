import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Calm pagination. Compact responsive layout — page-number buttons wrap on
 * narrow screens, "Page X of Y" caption only shows on sm+ to prevent horizontal
 * overflow on mobile. Uses design tokens (primary/foreground/muted), no
 * hard-coded blue/gray.
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(0);
    if (currentPage > 2) pages.push(-1);

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 3) pages.push(-1);
    pages.push(totalPages - 1);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full flex-wrap items-center justify-center gap-1.5 pt-2"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        aria-label="Previous page"
        className="h-9 w-9 border-border hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) =>
        page === -1 ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="select-none px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-9 w-9 nums ${
              page === currentPage
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
            }`}
          >
            {page + 1}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || isLoading}
        aria-label="Next page"
        className="h-9 w-9 border-border hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Caption hidden on mobile to avoid overflow. Aria-live for screen readers. */}
      <span className="hidden text-xs text-muted-foreground sm:ml-3 sm:inline nums" aria-live="polite">
        Page {currentPage + 1} of {totalPages}
      </span>
    </nav>
  );
};

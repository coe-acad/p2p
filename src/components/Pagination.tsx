import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (currentPage > 2) {
        pages.push(-1); // Ellipsis
      }

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push(-1); // Ellipsis
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        className="h-9 w-9"
      >
        <ChevronLeft size={18} />
      </Button>

      {pages.map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={`h-9 w-9 ${
              page === currentPage
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            {page + 1}
          </Button>
        )
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || isLoading}
        className="h-9 w-9"
      >
        <ChevronRight size={18} />
      </Button>

      <span className="ml-4 text-sm text-gray-600">
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
};

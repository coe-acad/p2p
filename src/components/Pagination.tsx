import { Box, Button, IconButton, Typography } from '@mui/material';
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
        pages.push(-1);
      }

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push(-1);
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
      <IconButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        size="small"
      >
        <ChevronLeft size={18} />
      </IconButton>

      {pages.map((page, index) => (
        page === -1 ? (
          <Typography key={`ellipsis-${index}`} sx={{ px: 1, color: 'text.secondary' }}>
            ...
          </Typography>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            sx={{ minWidth: 36, height: 36 }}
          >
            {page + 1}
          </Button>
        )
      ))}

      <IconButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || isLoading}
        size="small"
      >
        <ChevronRight size={18} />
      </IconButton>

      <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
        Page {currentPage + 1} of {totalPages}
      </Typography>
    </Box>
  );
};

import { useMemo } from 'react'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

/**
 * Compact, accessible pagination control built on shadcn's pagination primitives
 * — same look as the reference LMS project. Renders first page, current page
 * window, and last page with ellipses for the gaps.
 *
 * Props:
 *   page         — 1-indexed current page
 *   totalPages   — total pages (1 means no pagination needed)
 *   onPageChange — (next: number) => void
 *   siblingCount — pages shown either side of current (default 1)
 *   className    — wrapper class
 */
const DataPagination = ({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const items = useMemo(() => {
    if (totalPages <= 1) return []
    const range = (start, end) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i)

    const totalNumbers = siblingCount * 2 + 5
    if (totalPages <= totalNumbers) return range(1, totalPages)

    const leftSibling = Math.max(page - siblingCount, 1)
    const rightSibling = Math.min(page + siblingCount, totalPages)
    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    if (!showLeftDots && showRightDots) {
      return [...range(1, 3 + siblingCount * 2), 'right-ellipsis', totalPages]
    }
    if (showLeftDots && !showRightDots) {
      return [
        1,
        'left-ellipsis',
        ...range(totalPages - (2 + siblingCount * 2), totalPages),
      ]
    }
    return [
      1,
      'left-ellipsis',
      ...range(leftSibling, rightSibling),
      'right-ellipsis',
      totalPages,
    ]
  }, [page, totalPages, siblingCount])

  if (totalPages <= 1) return null

  const safeGo = (next) => (e) => {
    e?.preventDefault?.()
    if (next < 1 || next > totalPages || next === page) return
    onPageChange?.(next)
  }

  return (
    <Pagination className={cn('justify-center sm:justify-end', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={safeGo(page - 1)}
            aria-disabled={page <= 1}
            className={cn(page <= 1 && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        {items.map((it, idx) => {
          if (typeof it === 'string') {
            return (
              <PaginationItem key={`${it}-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }
          const isActive = it === page
          return (
            <PaginationItem key={it}>
              <PaginationLink
                href="#"
                isActive={isActive}
                onClick={safeGo(it)}
                aria-label={`Go to page ${it}`}
              >
                {it}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={safeGo(page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default DataPagination

"use client";

import * as React from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    showPageSizeSelector?: boolean;
    showItemCount?: boolean;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    pageSizeOptions = [6, 12, 24, 48],
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = true,
    showItemCount = true,
    className,
}: PaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near start
                pages.push(2, 3, 4, "ellipsis", totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push("ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In middle
                pages.push("ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
            }
        }

        return pages;
    };

    const pages = getPageNumbers();

    if (totalPages <= 1 && !showItemCount) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
                className
            )}
        >
            {/* Item count and page size */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {showItemCount && (
                    <span>
                        Hiển thị {startItem}-{endItem} / {totalItems} mục
                    </span>
                )}
                {showPageSizeSelector && onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span>Hiển thị</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-16 rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>mục</span>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {/* First page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">Trang đầu</span>
                    </Button>

                    {/* Previous page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Trang trước</span>
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {pages.map((page, index) =>
                            page === "ellipsis" ? (
                                <div
                                    key={`ellipsis-${index}`}
                                    className="flex h-8 w-8 items-center justify-center "
                                >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-lg",
                                        currentPage === page &&
                                        "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                                    )}
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </Button>
                            )
                        )}
                    </div>

                    {/* Next page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Trang sau</span>
                    </Button>

                    {/* Last page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Trang cuối</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Check,
    X,
    HandPlatter,
    Receipt,
} from "lucide-react";
import { Booking, BookingStatus } from "@/types/booking";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface BookingTableProps {
    bookings: Booking[];
    onView: (booking: Booking) => void;
    onEdit: (booking: Booking) => void;
    onCancel: (booking: Booking) => void;
    onApprove: (booking: Booking) => void;
    onAddService?: (booking: Booking) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const formatDate = (dateString: string) => {
    // Input YYYY-MM-DD
    const date = new Date(dateString);
    // Return DD/MM/YYYY
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatShortDate = (dateString: string) => {
    // Input YYYY-MM-DD
    const date = new Date(dateString);
    // Return DD/MM
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}


const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
        case "CONFIRMED":
            return { label: "Đã xác nhận", icon: CheckCircle2, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
        case "PENDING":
            return { label: "Chờ xử lý", icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
        case "CHECKED_IN":
            return { label: "Đã nhận phòng", icon: CheckCircle2, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
        case "CHECKED_OUT":
            return { label: "Đã trả phòng", icon: CheckCircle2, className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" };
        case "CANCELLED":
            return { label: "Đã hủy", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
        default:
            return { label: status, icon: Clock, className: "bg-slate-100 text-slate-700" };
    }
};

export function BookingTable({ bookings, onView, onEdit, onCancel, onApprove, onAddService }: BookingTableProps) {
    if (bookings.length === 0) {
        return (
            <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center text-muted-foreground">
                    Không tìm thấy đặt phòng nào
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold">Mã</TableHead>
                            <TableHead className="font-semibold">Khách hàng</TableHead>
                            <TableHead className="font-semibold">Phòng & Thời gian</TableHead>
                            <TableHead className="font-semibold">Trạng thái</TableHead>
                            <TableHead className="font-semibold">Tổng tiền</TableHead>
                            <TableHead className="font-semibold text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => {
                            const statusConfig = getStatusConfig(booking.status);
                            return (
                                <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <TableCell className="font-mono text-sm font-medium text-orange-600">
                                        {booking.bookingCode}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.guestName}</p>
                                            <p className="text-xs text-muted-foreground">{booking.guestPhone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="flex items-center gap-1 text-sm font-medium">
                                                <span>{booking.rooms?.[0]?.room?.roomNumber || "N/A"}</span>
                                                <span className="text-muted-foreground">({booking.numberOfNights} đêm)</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatShortDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${statusConfig.className} border-0 rounded-lg`}>
                                            <statusConfig.icon className="h-3 w-3 mr-1" />
                                            {statusConfig.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(booking.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 shadow-none cursor-pointer"
                                                        onClick={() => onApprove(booking)}
                                                        title="Xác nhận"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 shadow-none mr-1 cursor-pointer"
                                                        onClick={() => onCancel(booking)}
                                                        title="Hủy"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Add Service button for CHECKED_IN bookings */}
                                            {booking.status === 'CHECKED_IN' && onAddService && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 shadow-none cursor-pointer gap-1"
                                                    onClick={() => onAddService(booking)}
                                                    title="Thêm dịch vụ"
                                                >
                                                    <HandPlatter className="h-4 w-4" />
                                                    <span className="hidden xl:inline">Thêm dịch vụ</span>
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => onView(booking)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(booking)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    {booking.status === 'CHECKED_IN' && onAddService && (
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => onAddService(booking)}>
                                                            <HandPlatter className="h-4 w-4 mr-2" />
                                                            Thêm dịch vụ
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status === 'CHECKED_IN' && (
                                                        <Link href={`/admin/bookings/${booking.id}/checkout`}>
                                                            <DropdownMenuItem className="cursor-pointer text-orange-600">
                                                                <Receipt className="h-4 w-4 mr-2" />
                                                                Checkout & Hóa đơn
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    )}
                                                    {booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
                                                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => onCancel(booking)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Hủy đặt phòng
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>

                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


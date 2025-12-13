"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
    ServiceBooking,
    ServiceBookingStatus,
    getStatusLabel,
} from "@/services/service-bookings.api";

interface UpdateStatusDialogProps {
    booking: ServiceBooking | null;
    newStatus: ServiceBookingStatus;
    staffNotes: string;
    isUpdating: boolean;
    onStaffNotesChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function UpdateStatusDialog({
    booking,
    newStatus,
    staffNotes,
    isUpdating,
    onStaffNotesChange,
    onClose,
    onConfirm,
}: UpdateStatusDialogProps) {
    return (
        <Dialog open={!!booking} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Cap nhat trang thai</DialogTitle>
                    <DialogDescription>
                        Cap nhat trang thai don {booking?.bookingCode} thanh "{getStatusLabel(newStatus)}"
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Ghi chu nhan vien (tuy chon)</Label>
                        <Textarea
                            placeholder="Ghi chu..."
                            className="rounded-xl resize-none"
                            rows={3}
                            value={staffNotes}
                            onChange={(e) => onStaffNotesChange(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">
                        Huy
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isUpdating}
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cap nhat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

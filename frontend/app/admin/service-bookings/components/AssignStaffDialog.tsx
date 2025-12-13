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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ServiceBooking } from "@/services/service-bookings.api";
import { User } from "@/types/auth";

interface AssignStaffDialogProps {
    booking: ServiceBooking | null;
    staffUsers: User[];
    selectedStaffId: string;
    staffNotes: string;
    isAssigning: boolean;
    onStaffIdChange: (value: string) => void;
    onStaffNotesChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function AssignStaffDialog({
    booking,
    staffUsers,
    selectedStaffId,
    staffNotes,
    isAssigning,
    onStaffIdChange,
    onStaffNotesChange,
    onClose,
    onConfirm,
}: AssignStaffDialogProps) {
    return (
        <Dialog open={!!booking} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Phan cong nhan vien</DialogTitle>
                    <DialogDescription>
                        Phan cong nhan vien xu ly don dich vu {booking?.bookingCode}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Chon nhan vien</Label>
                        <Select value={selectedStaffId} onValueChange={onStaffIdChange}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Chon nhan vien" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName} ({user.role?.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Ghi chu (tuy chon)</Label>
                        <Textarea
                            placeholder="Ghi chu cho nhan vien..."
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
                        disabled={!selectedStaffId || isAssigning}
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                        {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Phan cong
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

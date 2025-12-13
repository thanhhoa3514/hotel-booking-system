"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Service } from "@/services/services.api";

interface DeleteServiceDialogProps {
    service: Service | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteServiceDialog({
    service,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteServiceDialogProps) {
    return (
        <AlertDialog open={!!service} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Xoa dich vu?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ban co chac chan muon xoa dich vu "{service?.name}"? Hanh dong nay khong the hoan tac.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Huy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Xoa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

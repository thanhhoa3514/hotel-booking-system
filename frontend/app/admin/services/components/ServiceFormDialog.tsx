"use client";

import { UseFormReturn, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import { Service, ServiceCategory, getCategoryLabel } from "@/services/services.api";
import { CreateServiceFormData } from "@/features/services/services.schema";

const categories: ServiceCategory[] = [
    "FOOD_BEVERAGE",
    "SPA_WELLNESS",
    "RECREATION",
    "TRANSPORTATION",
    "BUSINESS",
    "LAUNDRY",
    "CONCIERGE",
    "ROOM_SERVICE",
    "OTHER",
];

const pricingTypes = [
    { value: "FIXED", label: "Co dinh" },
    { value: "PER_HOUR", label: "Theo gio" },
    { value: "PER_PERSON", label: "Theo nguoi" },
    { value: "PER_ITEM", label: "Theo mon" },
];

interface ServiceFormDialogProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    isOpen: boolean;
    editingService: Service | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateServiceFormData) => void;
    onClose: () => void;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function ServiceFormDialog({
    form,
    isOpen,
    editingService,
    isSubmitting,
    onOpenChange,
    onSubmit,
    onClose,
}: ServiceFormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => onOpenChange(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Them dich vu
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingService ? "Chinh sua dich vu" : "Them dich vu moi"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingService
                            ? "Cap nhat thong tin dich vu"
                            : "Nhap thong tin dich vu moi"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ten dich vu</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="VD: Buffet Sang"
                                            className="rounded-xl"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (!editingService) {
                                                    form.setValue("slug", generateSlug(e.target.value));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="buffet-sang"
                                            className="rounded-xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mo ta</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mo ta dich vu..."
                                            className="rounded-xl resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danh muc</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Chon danh muc" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {getCategoryLabel(cat)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pricingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loai gia</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Chon loai gia" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {pricingTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="basePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gia co ban (VND)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="rounded-xl"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thoi gian (phut)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="60"
                                                className="rounded-xl"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? Number(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="maxCapacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Suc chua toi da</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                className="rounded-xl"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? Number(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thu tu hien thi</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="rounded-xl"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value ?? true}
                                                onChange={field.onChange}
                                                className="rounded"
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Kich hoat</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requiresBooking"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value ?? false}
                                                onChange={field.onChange}
                                                className="rounded"
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Can dat truoc</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="rounded-xl"
                            >
                                Huy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingService ? "Cap nhat" : "Tao moi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

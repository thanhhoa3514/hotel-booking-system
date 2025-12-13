"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    servicesApi,
    Service,
    ServiceCategory,
} from "@/services/services.api";
import {
    createServiceSchema,
    CreateServiceFormData,
} from "@/features/services/services.schema";
import {
    ServiceFormDialog,
    ServiceStatsCards,
    ServiceFilters,
    ServiceTable,
    DeleteServiceDialog,
} from "./components";

export default function AdminServicesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-services", categoryFilter, searchQuery],
        queryFn: () =>
            servicesApi.getServices({
                category: categoryFilter === "all" ? undefined : (categoryFilter as ServiceCategory),
                search: searchQuery || undefined,
                limit: 100,
            }),
    });

    const form = useForm<CreateServiceFormData>({
        resolver: zodResolver(createServiceSchema) as any,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            category: "OTHER" as const,
            pricingType: "FIXED" as const,
            basePrice: 0,
            isActive: true,
            requiresBooking: false,
            displayOrder: 0,
            imageUrl: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: servicesApi.createService,
        onSuccess: () => {
            toast.success("Tao dich vu thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            setIsCreateDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast.error("Khong the tao dich vu", {
                description: error.response?.data?.message,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateServiceFormData> }) =>
            servicesApi.updateService(id, data),
        onSuccess: () => {
            toast.success("Cap nhat dich vu thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            setEditingService(null);
            form.reset();
        },
        onError: (error: any) => {
            toast.error("Khong the cap nhat dich vu", {
                description: error.response?.data?.message,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: servicesApi.deleteService,
        onSuccess: () => {
            toast.success("Xoa dich vu thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            setDeletingService(null);
        },
        onError: (error: any) => {
            toast.error("Khong the xoa dich vu", {
                description: error.response?.data?.message,
            });
        },
    });

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        form.reset({
            name: service.name,
            slug: service.slug,
            description: service.description || "",
            category: service.category,
            pricingType: service.pricingType,
            basePrice: service.basePrice,
            isActive: service.isActive,
            requiresBooking: service.requiresBooking,
            duration: service.duration || undefined,
            maxCapacity: service.maxCapacity || undefined,
            displayOrder: service.displayOrder,
        });
    };

    const handleFormSubmit = (data: CreateServiceFormData) => {
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDialogClose = () => {
        setIsCreateDialogOpen(false);
        setEditingService(null);
        form.reset();
    };

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            handleDialogClose();
        } else {
            setIsCreateDialogOpen(true);
        }
    };

    const handleDeleteConfirm = () => {
        if (deletingService) {
            deleteMutation.mutate(deletingService.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quan ly dich vu
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quan ly danh muc dich vu cua khach san
                    </p>
                </div>

                <ServiceFormDialog
                    form={form}
                    isOpen={isCreateDialogOpen || !!editingService}
                    editingService={editingService}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                    onOpenChange={handleDialogOpenChange}
                    onSubmit={handleFormSubmit}
                    onClose={handleDialogClose}
                />
            </div>

            {/* Stats */}
            <ServiceStatsCards
                services={data?.data || []}
                total={data?.meta.total || 0}
            />

            {/* Filters */}
            <ServiceFilters
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                onSearchChange={setSearchQuery}
                onCategoryChange={setCategoryFilter}
            />

            {/* Services Table */}
            <ServiceTable
                services={data?.data || []}
                isLoading={isLoading}
                onEdit={openEditDialog}
                onDelete={setDeletingService}
            />

            {/* Delete Dialog */}
            <DeleteServiceDialog
                service={deletingService}
                isDeleting={deleteMutation.isPending}
                onClose={() => setDeletingService(null)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}

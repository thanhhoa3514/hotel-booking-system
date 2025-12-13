"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
} from "lucide-react";
import {
    Service,
    getCategoryLabel,
    formatServicePrice,
} from "@/services/services.api";

interface ServiceTableProps {
    services: Service[];
    isLoading: boolean;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
}

function ServiceTableSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-40" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-28" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16 mx-auto" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-8 w-8 ml-auto" />
                    </td>
                </tr>
            ))}
        </>
    );
}

function ServiceTableEmpty() {
    return (
        <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                Khong tim thay dich vu nao
            </td>
        </tr>
    );
}

interface ServiceRowProps {
    service: Service;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
}

function ServiceRow({ service, onEdit, onDelete }: ServiceRowProps) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.slug}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <Badge variant="outline" className="rounded-lg">
                    {getCategoryLabel(service.category)}
                </Badge>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium">
                    {formatServicePrice(service.basePrice, service.pricingType)}
                </p>
            </td>
            <td className="px-4 py-3 text-center">
                {service.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 rounded-lg">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hoat dong
                    </Badge>
                ) : (
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0 rounded-lg">
                        <XCircle className="h-3 w-3 mr-1" />
                        Tam dung
                    </Badge>
                )}
            </td>
            <td className="px-4 py-3 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                            onClick={() => onEdit(service)}
                            className="cursor-pointer"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Chinh sua
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(service)}
                            className="cursor-pointer text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xoa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

export function ServiceTable({
    services,
    isLoading,
    onEdit,
    onDelete,
}: ServiceTableProps) {
    return (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                Dich vu
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                Danh muc
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                Gia
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                                Trang thai
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                Thao tac
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            <ServiceTableSkeleton />
                        ) : services.length === 0 ? (
                            <ServiceTableEmpty />
                        ) : (
                            services.map((service) => (
                                <ServiceRow
                                    key={service.id}
                                    service={service}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

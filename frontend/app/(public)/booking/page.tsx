"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Check, CreditCard, User, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import Image from "next/image";
import { toast } from "sonner";

const STEPS = ["Room", "Details", "Payment", "Confirm"];

// Mock room data
const ROOM_TYPES = [
    { id: "1", name: "Deluxe Ocean View Suite", price: 299, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
    { id: "2", name: "Premium Family Room", price: 399, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400" },
    { id: "3", name: "Standard Double Room", price: 149, image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400" },
];

function BookingContent() {
    const searchParams = useSearchParams();
    const preselectedRoom = searchParams.get("roomType");

    const [currentStep, setCurrentStep] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedRoom, setSelectedRoom] = useState<string>(preselectedRoom || "");
    const [guests, setGuests] = useState("2");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Guest details form state
    const [guestDetails, setGuestDetails] = useState({
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
    });

    // Payment form state
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const selectedRoomData = ROOM_TYPES.find((r) => r.id === selectedRoom);
    const numberOfNights = dateRange?.from && dateRange?.to
        ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const totalPrice = selectedRoomData ? selectedRoomData.price * numberOfNights : 0;

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return selectedRoom && dateRange?.from && dateRange?.to;
            case 1:
                return guestDetails.fullName && guestDetails.email && guestDetails.phone;
            case 2:
                return paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        toast.success("Booking confirmed!", {
            description: "Check your email for confirmation details.",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Complete Your Booking
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Follow the steps below to reserve your room
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Progress value={progress} className="h-2 mb-4" />
                    <div className="flex justify-between">
                        {STEPS.map((step, index) => (
                            <div
                                key={step}
                                className={`flex items-center gap-2 ${index <= currentStep
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-slate-400"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${index < currentStep
                                        ? "bg-orange-600 text-white"
                                        : index === currentStep
                                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                            : "bg-slate-200 dark:bg-slate-700"
                                        }`}
                                >
                                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                {/* Step 1: Room Selection */}
                                {currentStep === 0 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <Building className="h-5 w-5" />
                                                Select Your Room
                                            </h2>
                                            <div className="grid gap-4">
                                                {ROOM_TYPES.map((room) => (
                                                    <div
                                                        key={room.id}
                                                        onClick={() => setSelectedRoom(room.id)}
                                                        className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-orange-500 ${selectedRoom === room.id
                                                            ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                                            : "border-slate-200 dark:border-slate-700"
                                                            }`}
                                                    >
                                                        <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                                            <Image src={room.image} alt={room.name} fill className="object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-medium">{room.name}</h3>
                                                            <p className="text-2xl font-bold text-orange-600">${room.price}<span className="text-sm font-normal text-slate-500">/night</span></p>
                                                        </div>
                                                        {selectedRoom === room.id && (
                                                            <Check className="h-5 w-5 text-orange-600" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Check-in / Check-out</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start cursor-pointer">
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dateRange?.from ? (
                                                                dateRange.to ? (
                                                                    <>{format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}</>
                                                                ) : format(dateRange.from, "MMM dd, yyyy")
                                                            ) : "Select dates"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Guests</Label>
                                                <Select value={guests} onValueChange={setGuests}>
                                                    <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4].map((n) => (
                                                            <SelectItem key={n} value={String(n)} className="cursor-pointer">{n} Guest{n > 1 ? "s" : ""}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Guest Details */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Guest Information
                                        </h2>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name *</Label>
                                                <Input id="fullName" value={guestDetails.fullName} onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })} placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" type="email" value={guestDetails.email} onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })} placeholder="john@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone *</Label>
                                                <Input id="phone" value={guestDetails.phone} onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })} placeholder="+1 234 567 890" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="requests">Special Requests</Label>
                                                <Input id="requests" value={guestDetails.specialRequests} onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })} placeholder="Any special requirements..." />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Payment Details
                                        </h2>
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardholderName">Cardholder Name</Label>
                                                <Input id="cardholderName" value={paymentDetails.cardholderName} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardholderName: e.target.value })} placeholder="JOHN DOE" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card Number</Label>
                                                <Input id="cardNumber" value={paymentDetails.cardNumber} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })} placeholder="1234 5678 9012 3456" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                                    <Input id="expiryDate" value={paymentDetails.expiryDate} onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })} placeholder="MM/YY" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvv">CVV</Label>
                                                    <Input id="cvv" value={paymentDetails.cvv} onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })} placeholder="123" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Confirmation */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in duration-300 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                                            <Check className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-2xl font-semibold">Review & Confirm</h2>
                                        <p className="text-slate-500">Please review your booking details before confirming.</p>
                                        <div className="text-left bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                                            <p><strong>Room:</strong> {selectedRoomData?.name}</p>
                                            <p><strong>Dates:</strong> {dateRange?.from && format(dateRange.from, "MMM dd, yyyy")} - {dateRange?.to && format(dateRange.to, "MMM dd, yyyy")}</p>
                                            <p><strong>Guest:</strong> {guestDetails.fullName}</p>
                                            <p><strong>Email:</strong> {guestDetails.email}</p>
                                            <p><strong>Total:</strong> <span className="text-xl font-bold text-orange-600">${totalPrice}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between mt-8 pt-6 border-t">
                                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="cursor-pointer">
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    {currentStep < STEPS.length - 1 ? (
                                        <Button onClick={handleNext} disabled={!canProceed()} className="bg-orange-600 hover:bg-orange-700 cursor-pointer">
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                                            {isSubmitting ? "Processing..." : "Confirm Booking"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedRoomData ? (
                                    <>
                                        <div className="relative aspect-video rounded-lg overflow-hidden">
                                            <Image src={selectedRoomData.image} alt={selectedRoomData.name} fill className="object-cover" />
                                        </div>
                                        <h3 className="font-semibold">{selectedRoomData.name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Price per night</span>
                                                <span>${selectedRoomData.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nights</span>
                                                <span>{numberOfNights || "-"}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-orange-600">${totalPrice || "-"}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">Select a room to see summary</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}

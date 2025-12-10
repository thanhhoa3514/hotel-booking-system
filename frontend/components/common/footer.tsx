import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-900">HotelBooking</h3>
                        <p className="text-sm text-slate-500">
                            Experience luxury and comfort in the heart of the city. Book your stay today.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-slate-400 hover:text-blue-600">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-blue-600">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-blue-600">
                                <Twitter size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                            <li><Link href="/search" className="hover:text-blue-600">Search</Link></li>
                            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/cancellation" className="hover:text-blue-600">Cancellation Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">We Accept</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Replace with actual payment icons/images if available, using text placeholders for now */}
                            <div className="bg-white border rounded px-2 py-1 text-xs text-slate-600 font-medium">Visa</div>
                            <div className="bg-white border rounded px-2 py-1 text-xs text-slate-600 font-medium">Mastercard</div>
                            <div className="bg-white border rounded px-2 py-1 text-xs text-slate-600 font-medium">Amex</div>
                            <div className="bg-white border rounded px-2 py-1 text-xs text-slate-600 font-medium">PayPal</div>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} HotelBooking. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-slate-900">Privacy</Link>
                        <Link href="#" className="hover:text-slate-900">Terms</Link>
                        <Link href="#" className="hover:text-slate-900">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

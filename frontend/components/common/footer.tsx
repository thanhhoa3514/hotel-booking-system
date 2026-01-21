import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-white mt-auto">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Stayzy Logo"
                                className="h-10 w-10 object-contain"
                            />
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                                Stayzy
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Nền tảng đặt phòng khách sạn thông minh hàng đầu Việt Nam. Trải nghiệm kỳ nghỉ hoàn hảo với dịch vụ tận tâm.
                        </p>
                        <div className="flex items-center gap-3">
                            <Link
                                href="#"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Facebook"
                            >
                                <Facebook size={18} />
                            </Link>
                            <Link
                                href="#"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </Link>
                            <Link
                                href="#"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Twitter"
                            >
                                <Twitter size={18} />
                            </Link>
                            <Link
                                href="#"
                                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Youtube"
                            >
                                <Youtube size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Khám phá</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <Link href="/" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link href="/rooms" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Danh sách phòng
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Dịch vụ
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <Link href="/help" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Trung tâm trợ giúp
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="/cancellation" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Chính sách hủy phòng
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-orange-400 transition-colors cursor-pointer">
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-orange-400 mt-0.5 shrink-0" />
                                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-orange-400 shrink-0" />
                                <span>1900 1234 56</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-orange-400 shrink-0" />
                                <span>support@stayzy.vn</span>
                            </li>
                        </ul>

                        {/* Payment Methods */}
                        <div className="mt-6">
                            <h5 className="text-sm font-medium text-white mb-3">Phương thức thanh toán</h5>
                            <div className="flex flex-wrap gap-2">
                                <div className="bg-white rounded px-2 py-1 text-xs text-slate-700 font-medium">
                                    Visa
                                </div>
                                <div className="bg-white rounded px-2 py-1 text-xs text-slate-700 font-medium">
                                    Mastercard
                                </div>
                                <div className="bg-white rounded px-2 py-1 text-xs text-slate-700 font-medium">
                                    MoMo
                                </div>
                                <div className="bg-white rounded px-2 py-1 text-xs text-slate-700 font-medium">
                                    ZaloPay
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p>© {new Date().getFullYear()} Stayzy. Bảo lưu mọi quyền.</p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-orange-400 transition-colors cursor-pointer">
                                Bảo mật
                            </Link>
                            <Link href="/terms" className="hover:text-orange-400 transition-colors cursor-pointer">
                                Điều khoản
                            </Link>
                            <Link href="/sitemap" className="hover:text-orange-400 transition-colors cursor-pointer">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

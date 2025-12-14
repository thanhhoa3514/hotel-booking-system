import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/features/search-bar";
import { Shield, Star, Clock, Headphones } from "lucide-react";

const FEATURES = [
    {
        icon: Shield,
        title: "Đảm bảo giá tốt nhất",
        description: "Cam kết giá tốt nhất thị trường, hoàn tiền nếu tìm thấy giá rẻ hơn.",
    },
    {
        icon: Star,
        title: "Phòng chất lượng cao",
        description: "Tất cả phòng được kiểm tra kỹ lưỡng, đảm bảo sạch sẽ và tiện nghi.",
    },
    {
        icon: Clock,
        title: "Đặt phòng tức thì",
        description: "Xác nhận đặt phòng ngay lập tức, không cần chờ đợi.",
    },
    {
        icon: Headphones,
        title: "Hỗ trợ 24/7",
        description: "Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn mọi lúc.",
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[90vh] w-full flex items-center justify-center">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop")',
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full container mx-auto px-4 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="text-center space-y-4 max-w-4xl">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
                            Trải nghiệm kỳ nghỉ <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">hoàn hảo</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 font-light drop-shadow max-w-2xl mx-auto">
                            Khám phá những phòng nghỉ sang trọng, tiện nghi đẳng cấp và dịch vụ tận tâm tại Stayzy.
                        </p>
                    </div>

                    {/* Floating Search Bar */}
                    <div className="w-full max-w-4xl mt-4">
                        <SearchBar />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mt-8">
                        {[
                            { value: "50+", label: "Phòng đẳng cấp" },
                            { value: "4.9", label: "Đánh giá trung bình" },
                            { value: "10k+", label: "Khách hài lòng" },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-white drop-shadow">{stat.value}</p>
                                <p className="text-white/80 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-white/80 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 space-y-3">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Tại sao chọn <span className="text-orange-600">Stayzy</span>?
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Chúng tôi mang đến trải nghiệm đặt phòng tuyệt vời nhất với những cam kết vượt trội.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                        <feature.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sẵn sàng cho kỳ nghỉ tiếp theo?
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        Khám phá các loại phòng đa dạng và tìm không gian hoàn hảo cho bạn ngay hôm nay.
                    </p>
                    <Link href="/rooms">
                        <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 font-semibold text-lg px-8 py-6 shadow-xl cursor-pointer">
                            Xem tất cả phòng
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}


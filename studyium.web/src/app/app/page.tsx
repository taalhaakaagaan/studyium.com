import Link from "next/link";
import { Download, Monitor, Laptop, ShieldCheck, CheckCircle, Info } from "lucide-react";

export default function AppPage() {
    return (
        <div className="container mx-auto px-4 py-20 min-h-screen">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Studyium Masaüstü Uygulaması
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Daha hızlı, daha güvenli ve kesintisiz bir deneyim için Studyium'u bilgisayarınıza indirin.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-12 max-w-4xl mx-auto">
                    {/* Windows */}
                    <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                            Önerilen
                        </div>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Monitor className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Windows</h3>
                        <p className="text-sm text-muted-foreground mb-4">Windows 10 ve üzeri için</p>

                        <div className="flex flex-col gap-3">
                            <a href="https://github.com/taalhaakaagaan/studyium.com/releases/download/v0.5.0/Studyium-Setup-0.5.0.exe" className="inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 gap-3">
                                <Download className="w-5 h-5" />
                                İndir (Windows)
                            </a>
                            <p className="text-xs text-muted-foreground">
                                Kurulum gerektirmez. İndirin, çıkartın ve .exe dosyasını çalıştırın.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Virüs Taraması Yapıldı
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                Güvenli İndirme
                            </span>
                        </div>
                    </div>

                    {/* Linux */}
                    <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-xl transition-all group">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Laptop className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Linux</h3>
                        <p className="text-sm text-muted-foreground mb-4">Tüm dağıtımlar için</p>

                        <div className="flex flex-col gap-3">
                            <a href="https://github.com/taalhaakaagaan/studyium.com/releases/download/v0.5.0/Studyium-0.5.0.AppImage" className="inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-all hover:scale-105 gap-3">
                                <Download className="w-5 h-5" />
                                İndir (.AppImage)
                            </a>
                            <p className="text-xs text-muted-foreground">
                                Tüm Linux dağıtımlarında çalışır.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust/Info Section */}
                <div className="max-w-2xl mx-auto bg-muted/30 rounded-xl p-6 border text-sm text-muted-foreground">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Kurulum Notları
                    </h4>
                    <ul className="space-y-2 text-left list-disc pl-5">
                        <li>
                            <strong>Windows:</strong> İndirdiğiniz .zip dosyasını sağ tıklayıp "Klasöre Ayıkla" diyerek açın. Klasör içindeki "Studyium" uygulamasını çalıştırın. Windows Defender uyarısı çıkarsa "Ek Bilgi &gt; Yine de Çalıştır" seçeneğini kullanabilirsiniz (Sertifika sürecimiz devam etmektedir).
                        </li>
                        <li>
                            <strong>Linux:</strong> .AppImage dosyasına sağ tıklayıp Özellikler &gt; İzinler sekmesinden "Dosyayı bir program gibi çalıştırmaya izin ver" seçeneğini işaretleyin.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="edge-fade" aria-hidden="true" />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

import { useEffect } from "react";
import Lenis from "lenis";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EditorialMarquee from "@/components/Marquee";
import MenuSection from "@/components/MenuSection";
import About from "@/components/About";
import Footer from "@/components/Footer";
import CartSheet from "@/components/CartSheet";
import CheckoutDialog from "@/components/CheckoutDialog";
import OrderTracking from "@/components/OrderTracking";
import AdminPage from "@/pages/AdminPage";

function Store() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <CartProvider>
      <div className="noise-overlay bg-white min-h-screen">
        <Header />
        <main>
          <Hero />
          <EditorialMarquee />
          <MenuSection />
          <About />
        </main>
        <Footer />
        <CartSheet />
        <CheckoutDialog />
        <OrderTracking />
        <Toaster position="bottom-center" richColors />
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

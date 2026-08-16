import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { CtaBudget } from "@/components/sections/CtaBudget";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <ProductCatalog />
        <CtaBudget />
        <Contact />
        <TrustBadges />
      </main>
      <Footer />
    </>
  );
}

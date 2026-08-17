import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Guides } from "@/components/sections/Guides";
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
        <Guides />
        <ProductCatalog />
        <CtaBudget />
        <Contact />
        <TrustBadges />
      </main>
      <Footer />
    </>
  );
}

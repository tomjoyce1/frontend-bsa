import CTABanner from "@/components/cta-banner";
import FAQ from "@/components/faq";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import { Navbar } from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import { DAppDemo } from "@/components/dapp-demo";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <Hero />
        <section className="py-12 px-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Try the dApp</h2>
              <p className="text-muted-foreground">
                Connect your wallet and interact with the Sui blockchain
              </p>
            </div>
            <div className="flex justify-center">
              <DAppDemo />
            </div>
          </div>
        </section>
        <Features />
        {/* <Pricing />
        <FAQ />
        <Testimonials /> */}
        <CTABanner />
        <Footer />
      </main>
    </>
  );
}

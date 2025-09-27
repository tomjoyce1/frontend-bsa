import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { LandlordDashboard } from "@/components/landlord-dashboard";

export default function LandlordPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <div className="min-h-[calc(100vh-12rem)] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-6">
                Landlord Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Create and manage rental contracts with blockchain escrow
              </p>
            </div>
            <LandlordDashboard />
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
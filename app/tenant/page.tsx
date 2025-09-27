import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { TenantDashboard } from "@/components/tenant-dashboard";

export default function TenantPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <div className="min-h-[calc(100vh-12rem)] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-6">
                Tenant Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Search and manage rental contracts with secure escrow deposits
              </p>
            </div>
            <TenantDashboard />
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
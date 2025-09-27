import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { ImageHashTool } from "@/components/image-hash-tool";

export default function ImagePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center py-20 px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-6">
              Image Hash Tool
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Convert images to hashes or retrieve images using hash values
            </p>
            <ImageHashTool />
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
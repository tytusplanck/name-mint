import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 bg-white min-h-screen flex flex-col">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold font-montserrat text-[#333333]">NameMint</h1>
        <p className="mt-4 text-xl font-inter text-[#333333]">Fresh Baby Name Ideas, Every Time</p>
      </header>

      <section className="flex justify-center flex-grow">
        <Button
          className="bg-[#63BCA5] text-white font-inter py-6 px-12 text-xl hover:bg-[#52AB94] transition-colors"
          asChild
        >
          <Link href="/baby-names">Generate Baby Names</Link>
        </Button>
      </section>

      <footer className="mt-12 text-center text-[#333333] font-inter">
        <p>&copy; 2023 NameMint. All rights reserved.</p>
      </footer>
    </main>
  )
}


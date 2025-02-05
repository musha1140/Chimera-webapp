import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="relative w-[800px] h-[600px]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kU6tElZQvPZixrcw8O6j7p3n9C7H4q.png"
          alt="Chimera Landing Page"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}

"use client"

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div
        className="relative w-full max-w-[1200px] aspect-[16/9] flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2gyxQ4Di9E87AYNB01W5saFkmFItR1.png)`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="flex flex-col items-center gap-2 text-[5rem] font-impact tracking-tight">
          <a href="#" className="px-16 transition-colors duration-300 hover:bg-white hover:text-black">
            DISCORD
          </a>
          <a href="#" className="px-16 transition-colors duration-300 hover:bg-white hover:text-black">
            MEMBERS
          </a>
          <a href="#" className="px-16 bg-white/80">
            <span className="text-black">CHIMERA</span>
          </a>
          <a href="#" className="px-16 transition-colors duration-300 hover:bg-white hover:text-black">
            TOWER
          </a>
          <a href="#" className="px-16 transition-colors duration-300 hover:bg-white hover:text-black">
            SHADOW
          </a>
        </div>
      </div>
    </div>
  )
}

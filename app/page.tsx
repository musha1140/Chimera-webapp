"use client"

import { useState } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuItems = [
    { text: "DISCORD", href: "https://discord.gg" },
    { text: "MEMBERS", href: "/members" },
    { text: "CHIMERA", href: "#" },
    { text: "TOWER", href: "/towers" },
    { text: "SHADOW", href: "/shadow" },
  ]

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div
        className="relative w-full max-w-[1200px] aspect-[16/9] flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ScfFzjOO6NbID2iBHQGrqosH6atabe.png)`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="flex flex-col items-center gap-2 text-[5rem] font-impact tracking-tight">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`px-16 transition-colors duration-300 ${
                item.text === "CHIMERA"
                  ? "bg-white/80 text-black"
                  : hoveredItem === item.text
                    ? "bg-white text-black"
                    : "text-white"
              } text-shadow`}
              onMouseEnter={() => setHoveredItem(item.text)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


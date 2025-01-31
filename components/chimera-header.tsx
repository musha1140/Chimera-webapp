import Link from "next/link"

export function ChimeraHeader() {
  return (
    <div className="w-full bg-black border-b border-gray-800">
      <div className="container mx-auto">
        <Link href="/" className="flex justify-center py-4">
          <span className="text-4xl font-impact tracking-tight text-white hover:text-gray-200 transition-colors">
            CHIMERA
          </span>
        </Link>
      </div>
    </div>
  )
}


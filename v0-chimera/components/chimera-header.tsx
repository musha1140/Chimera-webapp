import Link from "next/link"

export function ChimeraHeader() {
  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto">
        <Link href="/" className="flex justify-center py-4">
          <span className="text-4xl font-impact tracking-tight text-foreground hover:text-muted-foreground transition-colors">
            CHIMERA
          </span>
        </Link>
      </div>
    </div>
  )
}


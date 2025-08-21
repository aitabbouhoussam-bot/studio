import Link from "next/link";
import { Button } from "./ui/button";
import { Icons } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Feastly</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/#features"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              Pricing
            </Link>
             <Link
              href="#"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              API
            </Link>
             <Link
              href="#"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              Blog
            </Link>
             <Link
              href="#"
              className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

import { ShoppingBag } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2" />
          <span className="font-bold">Style Scout</span>
        </div>
        {/* Future Nav Links can go here */}
      </div>
    </header>
  );
}


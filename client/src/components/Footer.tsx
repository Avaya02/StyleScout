export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40">
      <div className="container flex flex-col items-center justify-center gap-4 h-24 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Style Scout. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


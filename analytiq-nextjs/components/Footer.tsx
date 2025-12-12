export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AnalytIQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

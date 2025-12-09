export default function Hero() {
  return (
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <div className="inline-block mb-4 sm:mb-6 md:mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl"></div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 relative z-10 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-normal px-2 pb-1">
          Scientific Study<br />Analysis
        </h2>
      </div>
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-2">
        AI-powered analysis of scientific research credibility, bias, and reliability
      </p>
    </div>
  )
}


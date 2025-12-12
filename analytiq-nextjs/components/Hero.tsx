export default function Hero() {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
      <div className="inline-block mb-3 sm:mb-4 md:mb-6 lg:mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl"></div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-3 md:mb-4 relative z-10 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight sm:leading-normal px-2 pb-1">
          Scientific Study<br className="hidden sm:block" /> Analysis
        </h2>
      </div>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-3 sm:px-2">
        AI-powered analysis of scientific research credibility, bias, and reliability
      </p>
    </div>
  )
}


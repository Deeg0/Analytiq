"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  IconFlask,
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconSparkles,
  IconSearch,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    researchField: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Handle form submission
    console.log("Form data:", formData)
    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  const features = [
    {
      icon: IconFlask,
      title: "Data Analysis",
      description: "Statistical analysis and data processing tools.",
    },
    {
      icon: IconChartBar,
      title: "Visualization",
      description: "Create charts and visualizations for your findings.",
    },
    {
      icon: IconDatabase,
      title: "Data Management",
      description: "Organize and manage research data securely.",
    },
    {
      icon: IconFileText,
      title: "Documentation",
      description: "Create, organize, and share research papers and reports.",
    },
    {
      icon: IconSearch,
      title: "Literature Search",
      description: "Find and review academic papers and publications.",
    },
    {
      icon: IconSparkles,
      title: "AI Insights",
      description: "AI-powered tools to discover patterns and generate hypotheses.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logoanaly.png"
              alt="AnalytIQ Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-lg font-semibold">AnalytIQ</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Skip
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <IconCheck className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-16 transition-colors ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to AnalytIQ
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Research tools for data analysis, visualization, and documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="transition-all hover:shadow-md hover:border-primary/20"
                  >
                    <CardHeader className="gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} size="lg">
                Get Started
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Tell us about yourself
              </h1>
              <p className="text-xl text-muted-foreground">
                Help us personalize your experience.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  We'll use this information to customize your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    placeholder="University, Company, etc."
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="researchField">Research Field (Optional)</Label>
                  <Input
                    id="researchField"
                    placeholder="e.g., Biology, Physics, Social Sciences"
                    value={formData.researchField}
                    onChange={(e) =>
                      handleInputChange("researchField", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 max-w-2xl mx-auto">
              <Button variant="outline" onClick={handleBack} size="lg">
                Back
              </Button>
              <Button
                onClick={handleNext}
                size="lg"
                disabled={!formData.name || !formData.email}
              >
                Continue
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <IconCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                You're all set!
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Welcome to AnalytIQ, {formData.name || "researcher"}. Your
                workspace is ready.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Review Your Information</CardTitle>
                <CardDescription>
                  You can update this information later in your settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {formData.organization && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{formData.organization}</span>
                  </div>
                )}
                {formData.researchField && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Research Field</span>
                    <span className="font-medium">{formData.researchField}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 max-w-2xl mx-auto">
              <Button variant="outline" onClick={handleBack} size="lg">
                Back
              </Button>
              <Button onClick={handleSubmit} size="lg">
                Go to Dashboard
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


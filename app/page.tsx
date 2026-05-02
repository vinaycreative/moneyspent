"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, IndianRupee } from "lucide-react"
import GoogleOneTapComponent from "@/components/GoogleOneTap"

const onboardingSteps = [
  {
    id: 1,
    title: "Know where it\nactually goes.",
    description:
      "Log a transaction in 4 taps. We'll do the math, draw the charts, and nudge you when it matters.",
  },
  {
    id: 2,
    title: "Track every\npenny.",
    description:
      "Record all income and expenses with detailed categorisation. Never lose track of where your money goes.",
  },
  {
    id: 3,
    title: "Smart insights\nthat matter.",
    description:
      "Spot spending patterns with beautiful charts, trends, and a spend-rhythm heatmap.",
  },
  {
    id: 4,
    title: "All accounts,\none place.",
    description:
      "Bank, credit card, cash, investments — everything in one secure app.",
  },
]

function HeroIllustration() {
  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      {/* Bars */}
      <div
        style={{
          position: "absolute", left: 10, bottom: 28,
          display: "flex", alignItems: "flex-end", gap: 12, height: 120,
        }}
      >
        {[44, 66, 88, 110].map((h, i) => (
          <div
            key={i}
            style={{
              width: 30, height: h, borderRadius: 9,
              background: i === 3 ? "var(--ms-accent)" : "var(--surface-alt)",
              border: i === 3 ? "none" : "1px solid var(--line)",
              transformOrigin: "bottom",
              animation: `bar-rise 700ms ${i * 100}ms both cubic-bezier(.2,.8,.2,1)`,
            }}
          />
        ))}
      </div>
      {/* Baseline */}
      <div
        style={{
          position: "absolute", left: 8, right: 8, bottom: 26,
          height: 1, background: "var(--line-strong)",
        }}
      />
      {/* Trend line */}
      <svg width="200" height="200" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          d="M 20 145 L 62 122 L 104 86 L 150 44"
          stroke="var(--ms-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round"
          strokeDasharray="220" strokeDashoffset="220"
          style={{ animation: "dash-in 900ms 400ms forwards ease-out" }}
        />
        <circle
          cx="150" cy="44" r="7" fill="var(--ms-accent)"
          style={{ animation: "pop 400ms 1200ms both" }}
        />
      </svg>
      {/* Star */}
      <div
        style={{
          position: "absolute", top: 14, right: 16,
          color: "var(--ms-accent)",
          animation: "pop 400ms 900ms both",
          fontSize: 22, lineHeight: 1,
        }}
      >
        ✦
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextStep = () => {
    setIsAutoPlaying(true)
    if (currentStep < onboardingSteps.length - 1) setCurrentStep(currentStep + 1)
    else setShowSignIn(true)
  }

  const prevStep = () => {
    setIsAutoPlaying(true)
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  if (showSignIn) {
    return (
      <div
        className="min-h-screen mobile-viewport flex items-center justify-center bg-paper"
      >
        <div
          className="min-w-[320px] max-w-[400px] mx-auto h-screen flex flex-col items-center justify-center px-7"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* Logo */}
            <div
              style={{
                width: 72, height: 72, borderRadius: 22,
                background: "linear-gradient(135deg, var(--ms-accent), color-mix(in oklab, var(--ms-accent) 50%, var(--ink)))",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px color-mix(in oklab, var(--ms-accent) 30%, transparent)",
                marginBottom: 16,
              }}
            >
              <IndianRupee className="w-9 h-9 text-white" />
            </div>

            <h1
              className="text-3xl font-bold mb-2 text-ink tracking-[-0.03em]"
            >
              MoneySpent
            </h1>
            <p className="text-sm mb-10 text-ms-muted">
              Track. Analyze. Control.
            </p>

            <div className="w-full space-y-5">
              <GoogleOneTapComponent />
              <p className="text-xs text-ms-muted">
                Join thousands managing their finances smarter
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const step = onboardingSteps[currentStep]

  return (
    <div
      className="min-h-screen mobile-viewport bg-paper"
    >
      <div className="min-w-[320px] max-w-[400px] mx-auto h-screen flex flex-col px-7 pt-10 pb-8">

        {/* Progress dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {onboardingSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAutoPlaying(true)
                  setCurrentStep(i)
                }}
                className="relative overflow-hidden"
                style={{
                  width: i === currentStep ? 32 : 6,
                  height: 6, borderRadius: 3,
                  background: i < currentStep ? "var(--ms-accent)" : "var(--surface-alt)",
                  transition: "all .3s ease",
                  border: "none", cursor: "pointer", padding: 0,
                }}
              >
                {i === currentStep && isAutoPlaying && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="absolute top-0 left-0 bottom-0"
                    style={{ background: "var(--ink)" }}
                    onAnimationComplete={() => {
                      if (i < onboardingSteps.length - 1) {
                        setCurrentStep(i + 1)
                      } else {
                        setIsAutoPlaying(false)
                      }
                    }}
                  />
                )}
                {i === currentStep && !isAutoPlaying && (
                  <div
                    className="absolute top-0 left-0 bottom-0 w-full"
                    style={{ background: "var(--ink)" }}
                  />
                )}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-ms-muted">
            {currentStep + 1} / {onboardingSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28 }}
              className="w-full flex flex-col items-center text-center"
            >
              {currentStep === 0 && (
                <div className="mb-8">
                  <HeroIllustration />
                </div>
              )}

              {currentStep !== 0 && (
                <div
                  className="mb-8"
                  style={{
                    width: 88, height: 88, borderRadius: 26,
                    background: "color-mix(in oklab, var(--ms-accent) 12%, var(--surface))",
                    border: "1px solid color-mix(in oklab, var(--ms-accent) 25%, var(--line))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <IndianRupee
                    className="w-10 h-10 text-ms-accent"
                  />
                </div>
              )}

              <h1
                className="text-[2rem] font-bold mb-4 text-ink tracking-[-0.03em] leading-[1.15] whitespace-pre-line"
              >
                {step.title}
              </h1>
              <p
                className="text-base leading-relaxed max-w-[280px] text-ms-muted"
              >
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3 mt-6">
          {currentStep === 0 ? (
            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-2 w-full py-[13px] rounded-xl font-semibold text-[15px] transition-opacity bg-ms-accent text-white"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex items-center justify-center gap-1 px-5 py-[13px] rounded-xl font-medium text-sm transition-opacity border border-line-strong bg-transparent text-ms-muted shrink-0"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 py-[13px] rounded-xl font-semibold text-[15px] transition-opacity bg-ink text-paper"
              >
                {currentStep === onboardingSteps.length - 1 ? "Get started" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSignIn(true)}
            className="w-full text-center text-sm py-2 transition-opacity text-ms-muted bg-transparent border-none cursor-pointer"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  )
}

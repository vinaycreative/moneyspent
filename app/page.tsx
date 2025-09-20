"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  PieChart,
  Target,
  Shield,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  BarChart3,
  Calendar,
  Smartphone,
  Zap,
  IndianRupee,
} from "lucide-react"
import GoogleOneTapComponent from "@/components/GoogleOneTap"

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to MoneySpent",
    subtitle: "Your Personal Finance Manager",
    description:
      "Take control of your financial life with our intuitive and powerful money management app.",
    icon: IndianRupee,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "Track Every Penny",
    subtitle: "Complete Financial Visibility",
    description:
      "Record all your income and expenses with detailed categorization. Never lose track of where your money goes.",
    icon: BarChart3,
    color: "from-green-500 to-teal-600",
  },
  {
    id: 3,
    title: "Smart Analytics",
    subtitle: "Insights That Matter",
    description:
      "Get powerful insights into your spending patterns with beautiful charts and trend analysis.",
    icon: PieChart,
    color: "from-orange-500 to-red-600",
  },
  {
    id: 4,
    title: "Multiple Accounts",
    subtitle: "Manage Everything in One Place",
    description:
      "Connect your bank accounts, credit cards, cash, and investments. All your finances in one secure app.",
    icon: Shield,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 5,
    title: "Set & Achieve Goals",
    subtitle: "Turn Dreams into Reality",
    description:
      "Set financial goals, track your progress, and celebrate your achievements. Your financial future starts today.",
    icon: Target,
    color: "from-indigo-500 to-blue-600",
  },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLastStep, setIsLastStep] = useState(false)

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLastStep(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsLastStep(false)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    setIsLastStep(false)
  }

  if (isLastStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 mobile-viewport">
        <div className="min-w-[320px] max-w-[400px] mx-auto h-screen flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">MoneySpent</h1>
              <p className="text-gray-600 text-base font-medium">Track. Analyze. Control.</p>
              {/* <p className="text-gray-600">Ready to start your financial journey?</p> */}
            </div>

            {/* Sign In Section */}
            <div className="w-full space-y-6">
              <GoogleOneTapComponent />

              <div className="text-sm text-gray-500">
                <p>Join thousands of users managing their finances smarter</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentStepData = onboardingSteps[currentStep]
  const IconComponent = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 mobile-viewport">
      <div className="min-w-[320px] max-w-[400px] mx-auto h-screen flex flex-col">
        {/* Progress Bar */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "bg-blue-600 w-6"
                      : index < currentStep
                      ? "bg-blue-400"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Icon */}
              <div className="mb-8">
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${currentStepData.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                >
                  <IconComponent className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Text Content */}
              <div className="mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{currentStepData.title}</h1>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {currentStepData.subtitle}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {currentStep === 0 ? (
                  // First screen: Only Get Started button
                  <div className="w-full flex justify-center">
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                    >
                      Get Started
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  // Other screens: Back and Next buttons
                  <>
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>

                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip Button */}
        <div className="px-6 pb-8">
          <button
            onClick={() => setIsLastStep(true)}
            className="w-full text-center text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors py-2"
          >
            Skip to sign in
          </button>
        </div>
      </div>
    </div>
  )
}

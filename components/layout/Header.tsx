"use client"
import { useAuth } from "@/hooks"

interface Header {
  subText: string
  mainText?: string
  rightComponent?: React.ReactNode
}

const Header = ({ subText, mainText, rightComponent }: Header) => {
  const { user, userName } = useAuth()

  const firstName = userName?.split(" ")?.[0]
  return (
    <header className="h-fit flex items-start justify-between">
      <div>
        <p className="text-xs text-ms-muted font-medium mb-0.5">{subText}</p>
        <h1 className="text-3xl font-bold text-ink tracking-tight">
          {mainText ?? `Hey ${firstName}`}
        </h1>
      </div>
      {rightComponent}
    </header>
  )
}

export default Header

import { cn } from "@/lib/utils"

const Page = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <main
      className={cn(
        "h-[calc(100dvh-70px)] min-w-[320px] max-w-[400px] p-4 mx-auto mobile-viewport bg-paper pb-[70px]",
        className,
      )}
    >
      {children}
    </main>
  )
}

export default Page

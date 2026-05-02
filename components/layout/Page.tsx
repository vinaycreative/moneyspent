import { cn } from "@/lib/utils"

const Page = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <main
      className={cn(
        "h-dvh min-w-[320px] max-w-[400px] p-4 mx-auto bg-paper pb-[80px] scrollbar-hide",
        className,
      )}
    >
      {children}
    </main>
  )
}

export default Page

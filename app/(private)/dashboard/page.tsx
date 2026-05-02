import { Settings } from "lucide-react"
import moment from "moment-timezone"
import Link from "next/link"
import Header from "@/components/layout/Header"
import StatsWidget from "@/components/dashboard/StatsWidget"
import Page from "@/components/layout/Page"
import { Suspense } from "react"

export default function Dashboard() {
  return (
    <Page className="space-y-4 grid grid-rows-[auto_1fr]">
      <Header
        subText={moment().format("dddd, MMM D")}
        rightComponent={
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center shadow-sm active:scale-95 transition-all text-ms-muted hover:text-ink"
          >
            <Settings size={18} />
          </Link>
        }
      />
      <Suspense>
        <StatsWidget />
      </Suspense>
    </Page>
  )
}

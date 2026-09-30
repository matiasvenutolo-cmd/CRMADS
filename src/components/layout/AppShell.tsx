import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'
import { Toaster } from '@/components/Toaster'
import { CommandPalette } from '@/components/CommandPalette'
import { DemoTour } from '@/components/DemoTour'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-20 md:pb-8">{children}</main>
      </div>
      <MobileNav />
      <Toaster />
      <CommandPalette />
      <DemoTour />
    </div>
  )
}

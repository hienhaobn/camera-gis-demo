import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MapView } from '@/components/map/MapView'
import { BottomSheet } from '@/components/layout/BottomSheet'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { useMapStore } from '@/stores/useMapStore'

function App() {
  const [loading, setLoading] = useState(true)
  const selectedCamera = useMapStore((state) => state.selectedCamera)

  return (
    <TooltipProvider>
      {loading ? (
        <LoadingScreen onFinished={() => setLoading(false)} />
      ) : (
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden">
              <Header />
              <div className="flex-1 w-full h-full relative overflow-hidden bg-[#070a10]">
                <MapView />
                <BottomSheet key={selectedCamera?.id || 'none'} />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
    </TooltipProvider>
  )
}

export default App

import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MapView } from '@/components/map/MapView';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { useMapStore } from '@/stores/useMapStore';

export function MapPage() {
  const selectedCamera = useMapStore((state) => state.selectedCamera);

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 h-full overflow-hidden bg-background relative">
        <MapView />
        <BottomSheet key={selectedCamera?.id || 'none'} />
      </SidebarInset>
    </div>
  );
}
export default MapPage;

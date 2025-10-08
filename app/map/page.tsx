
'use client';

import Header from '@/components/rdr2/Header';
import dynamic from 'next/dynamic';
import { Loader2, MousePointerClick } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const InteractiveMap = dynamic(
  () => import('@/components/rdr2/InteractiveMap'),
  { 
    loading: () => (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-black">
        <Loader2 className="mr-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading Map...</p>
      </div>
    ),
    ssr: false 
  }
);

function MapPageContents() {
  const searchParams = useSearchParams();
  const isSelecting = searchParams.get('selectPoint') === 'true';

  return (
    <div className="flex h-screen flex-col">
      <Header />
      {isSelecting && (
          <div className="absolute top-[80px] left-1/2 z-[1001] w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
             <Alert className="bg-background/90 text-center border-accent">
                <MousePointerClick className="h-4 w-4" />
                <AlertTitle className="font-headline">Selection Mode Active</AlertTitle>
                <AlertDescription>
                    Click anywhere on the map to select coordinates for your new legend item.
                </AlertDescription>
            </Alert>
          </div>
      )}
      <main className="flex-1 overflow-hidden">
        <InteractiveMap isSelecting={isSelecting} />
      </main>
    </div>
  );
}


export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapPageContents />
    </Suspense>
  )
}

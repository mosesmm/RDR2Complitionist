

'use client';

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Settings, Loader2, Check, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { IconPreview } from '@/components/rdr2/IconPicker';
import { isUrl } from '@/lib/map-icon-helpers';

const createTextIcon = (text: string) => {
    const iconHtml = `<div style="font-size: 24px; text-shadow: 0 0 3px black, 0 0 3px black, 0 0 3px black;">${text}</div>`;
    return new L.DivIcon({
        html: iconHtml,
        className: 'leaflet-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

const createImageIcon = (url: string) => {
    return new L.Icon({
        iconUrl: url,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
    });
};

const tempIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImhzbCgwIDEwMCUgNTAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNyb3NzaGFpciI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48bGluZSB4MT0iMjIiIHgyPSIxOCIgeTE9IjEyIiB5Mj0iMTIiLz48bGluZSB4MT0iNiIgeDI9IjIiIHkxPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB4Mj0iMTIiIHkxPSI2IiB5Mj0iMiIvPjxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMjIiIHkyPSIxOCIvPjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

interface InteractiveMapProps {
    isSelecting?: boolean;
}

const MAP_IMAGE_URL = '/rdr2-map.jpg';

export default function InteractiveMap({ isSelecting = false }: InteractiveMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
    const [mapDimensions, setMapDimensions] = useState<{width: number, height: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
    const layersRef = useRef<Record<string, L.LayerGroup>>({});
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const { settings, isLoaded: settingsLoaded } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedPoint, setSelectedPoint] = useState<{lat: number, lng: number} | null>(null);
    const tempMarkerRef = useRef<L.Marker | null>(null);

    // Effect for initializing the map and handling image changes
    useEffect(() => {
        if (!settingsLoaded || !mapContainerRef.current) return;

        let isMounted = true;
        
        const setupMap = (imageUrl: string) => {
            setIsLoading(true);
            const img = new window.Image();
            img.onload = () => {
                if (!isMounted || !mapContainerRef.current) return;
                
                const { width, height } = img;
                setMapDimensions({ width, height });
                const bounds = new L.LatLngBounds([0, 0], [height, width]);

                if (!mapRef.current) {
                    const mapInstance = L.map(mapContainerRef.current, {
                        crs: L.CRS.Simple,
                        zoomControl: false,
                        maxBounds: bounds,
                        minZoom: settings.minZoom,
                        preferCanvas: true, // Performance optimization
                        zoomAnimation: false, // Performance optimization
                        fadeAnimation: false, // Performance optimization
                        zoomSnap: 0, // Allow fractional zoom for smoother scroll wheel action
                    });
                    
                    imageOverlayRef.current = L.imageOverlay(imageUrl, bounds).addTo(mapInstance);
                    
                    const center = bounds.getCenter();
                    mapInstance.setView(center, settings.minZoom);

                    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
                    
                    mapRef.current = mapInstance;

                    mapInstance.on('click', (e) => {
                        if (isSelecting) {
                            if (tempMarkerRef.current) {
                                mapInstance?.removeLayer(tempMarkerRef.current);
                            }
                            const tempMarker = L.marker(e.latlng, { icon: tempIcon }).addTo(mapInstance!);
                            tempMarkerRef.current = tempMarker;
                            setSelectedPoint(e.latlng);
                        }
                    });
                } else {
                    if (imageOverlayRef.current) {
                        imageOverlayRef.current.setUrl(imageUrl);
                        imageOverlayRef.current.setBounds(bounds);
                    }
                    mapRef.current.options.maxBounds = bounds;
                    const center = bounds.getCenter();
                    mapRef.current.setView(center, settings.minZoom);
                }

                setIsLoading(false);
            };
            img.onerror = () => {
                if (!isMounted) return;
                setError("Could not load map image. Please ensure `rdr2-map.jpg` is in the `public` folder.");
                setIsLoading(false);
            };
            img.src = imageUrl;
        };

        setupMap(MAP_IMAGE_URL);

        return () => {
            isMounted = false;
        };
    }, [settingsLoaded]); 
    
    // Effect for handling changes to selection mode, zoom etc.
    useEffect(() => {
        if (!mapRef.current) return;

        if (mapContainerRef.current) {
            mapContainerRef.current.style.cursor = isSelecting ? 'crosshair' : '';
        }
        
        if(isSelecting && tempMarkerRef.current) {
            mapRef.current.removeLayer(tempMarkerRef.current);
            tempMarkerRef.current = null;
            setSelectedPoint(null);
        }

        mapRef.current.setMinZoom(settings.minZoom);

    }, [isSelecting, settings.minZoom])

    // Effect for updating markers when legend or visibility changes
    useEffect(() => {
        if (!mapRef.current || !mapDimensions) return;
        const map = mapRef.current;
        const { height, width } = mapDimensions;

        // Clear old layers
        Object.values(layersRef.current).forEach(layer => layer.remove());
        layersRef.current = {};

        // Create new layers
        settings.legendSections.forEach(section => {
            const layerGroup = L.layerGroup();
            
            let sectionIcon: L.Icon | L.DivIcon;
            
            if (isUrl(section.icon)) {
                sectionIcon = createImageIcon(section.icon);
            } else {
                sectionIcon = createTextIcon(section.icon);
            }
            
            section.items.forEach(item => {
                const y = height * (item.y / 100);
                const x = width * (item.x / 100);
                const marker = L.marker([y, x], { icon: sectionIcon }).bindPopup(item.name);
                layerGroup.addLayer(marker);
            });
            layersRef.current[section.id] = layerGroup;

            if (visibleSections[section.id] !== false) {
                layerGroup.addTo(map);
            }
        });
    }, [settings.legendSections, mapDimensions, visibleSections]);

    const handleConfirm = () => {
        if (selectedPoint && mapRef.current && mapDimensions) {
            const { height: mapHeight, width: mapWidth } = mapDimensions;
            
            const percentY = (selectedPoint.lat / mapHeight) * 100;
            const percentX = (selectedPoint.lng / mapWidth) * 100;

            const params = new URLSearchParams(searchParams.toString());
            params.set('y', percentY.toString());
            params.set('x', percentX.toString());
            params.delete('selectPoint'); // Turn off selection mode

            router.push(`/map/settings?${params.toString()}`);
        }
    };

    const handleCancel = () => {
        if (tempMarkerRef.current && mapRef.current) {
            mapRef.current.removeLayer(tempMarkerRef.current);
        }
        setSelectedPoint(null);
    };



    const toggleSectionVisibility = (sectionId: string) => {
        setVisibleSections(prev => {
            const newState = !(prev[sectionId] !== false);
            const layer = layersRef.current[sectionId];
            if (layer && mapRef.current) {
                if (newState) {
                    layer.addTo(mapRef.current);
                } else {
                    layer.removeFrom(mapRef.current);
                }
            }
            return {
                ...prev,
                [sectionId]: newState
            };
        });
    };

    return (
        <div className="relative h-full w-full overflow-hidden bg-black">
            <div id="map-container" ref={mapContainerRef} className="h-full w-full" />
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <Loader2 className="mr-4 h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading map data...</p>
                </div>
            )}
            
            {!isLoading && error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 z-20">
                    <Alert variant="destructive" className="max-w-md pointer-events-auto">
                        <AlertTitle>Error Loading Map</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {isSelecting && selectedPoint && (
                 <div className="absolute bottom-10 left-1/2 z-[1001] w-full max-w-sm -translate-x-1/2 px-4">
                     <Alert className="bg-background/90 text-center border-accent">
                         <AlertTitle className="font-headline">Confirm Coordinates</AlertTitle>
                         <AlertDescription>
                            Use these coordinates or choose again. <br/>
                            X: {mapDimensions ? ((selectedPoint.lng / mapDimensions.width) * 100).toFixed(2) : '...'}%, 
                            Y: {mapDimensions ? ((selectedPoint.lat / mapDimensions.height) * 100).toFixed(2) : '...'}%
                         </AlertDescription>
                         <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={handleConfirm} size="sm">
                                <Check className="mr-2 h-4 w-4" /> Confirm Selection
                            </Button>
                            <Button onClick={handleCancel} variant="outline" size="sm">
                                <X className="mr-2 h-4 w-4" /> Choose Again
                            </Button>
                         </div>
                    </Alert>
                </div>
            )}

            {settingsLoaded && !error && (
                <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
                    <Card className="bg-card/80">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Map Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {settings.legendSections.map(section => (
                                <div key={section.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`section-toggle-${section.id}`}
                                        checked={visibleSections[section.id] !== false}
                                        onCheckedChange={() => toggleSectionVisibility(section.id)}
                                    />
                                    <Label htmlFor={`section-toggle-${section.id}`} className="flex items-center gap-2 cursor-pointer">
                                        <IconPreview icon={section.icon} />
                                        {section.name}
                                    </Label>
                                </div>
                            ))}
                             {settings.legendSections.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">No legend sections defined.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

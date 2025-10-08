

'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { set as dbSet, get as dbGet, del as dbDel } from '@/lib/db';
import { legendaryAnimals } from '@/lib/map-data';
import { useToast } from '@/hooks/use-toast';

export type ShuffleFrequency = 'pageload' | '30s' | '60s' | '3min' | '5min' | '10min' | '15min' | 'hourly' | '12h' | 'daily';

const validFrequencies: ShuffleFrequency[] = ['pageload', '30s', '60s', '3min', '5min', '10min', '15min', 'hourly', '12h', 'daily'];

export interface CustomImage {
    url: string;
    hint: string;
}

export interface LegendItem {
    id: string;
    name: string;
    x: number;
    y: number;
}
  
export interface LegendSection {
    id: string;
    name: string;
    icon: string; // Can be an emoji or a data URL for a custom uploaded icon
    items: LegendItem[];
}

export interface CustomIcon {
    id: string;
    name: string;
    url: string;
    paths?: string[];
}

export interface CustomIconSet {
    icons: CustomIcon[];
}

interface Settings {
  backgroundImages: CustomImage[];
  shuffleFrequency: ShuffleFrequency;
  backgroundBlur: number;
  useDefaultTheme: boolean;
  minZoom: number;
  legendSections: LegendSection[];
}

// Separate state for large items to avoid localStorage quota issues
interface LargeItems {
    customLogo: string | null;
}

interface SettingsContextType {
  settings: Settings;
  largeItems: LargeItems;
  isLoaded: boolean;
  lastShuffleTime: number | null;
  setLastShuffleTime: (time: number) => void;
  addImage: (image: CustomImage) => void;
  removeImage: (url: string) => void;
  updateShuffleFrequency: (frequency: ShuffleFrequency) => void;
  updateBackgroundBlur: (blur: number) => void;
  updateCustomLogo: (file: File | null) => void;
  toggleDefaultTheme: (useDefault: boolean) => void;
  forceShuffle: () => void;
  updateMinZoom: (zoom: number) => void;
  addLegendSection: (name: string, icon: string) => void;
  updateLegendSection: (sectionId: string, name: string, icon: string) => void;
  deleteLegendSection: (sectionId: string) => void;
  addLegendItem: (sectionId: string, item: Omit<LegendItem, 'id'>) => void;
  updateLegendItem: (sectionId: string, itemId: string, item: LegendItem) => void;
  deleteLegendItem: (sectionId: string, itemId: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const initialLegend: LegendSection[] = [
    {
        id: 'legendary-animals',
        name: 'Legendary Animals',
        icon: '🐾',
        items: legendaryAnimals.map(animal => ({ ...animal, id: animal.name.toLowerCase().replace(/ /g, '-') }))
    }
]

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    backgroundImages: [],
    shuffleFrequency: 'pageload',
    backgroundBlur: 4, 
    useDefaultTheme: false,
    minZoom: -2,
    legendSections: initialLegend,
  });
  const [largeItems, setLargeItems] = useState<LargeItems>({
    customLogo: null,
  });
  const [lastShuffleTime, setLastShuffleTime] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage and IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    const currentLargeItems: LargeItems = { customLogo: null };

    const loadSettings = async () => {
        try {
            // Load small settings from localStorage
            const savedSettings = localStorage.getItem('rdr2-settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Data validation and migration
                if (!validFrequencies.includes(parsed.shuffleFrequency)) parsed.shuffleFrequency = 'pageload';
                if (typeof parsed.backgroundBlur !== 'number') parsed.backgroundBlur = 4;
                if (typeof parsed.useDefaultTheme !== 'boolean') parsed.useDefaultTheme = false;
                if (!Array.isArray(parsed.backgroundImages)) parsed.backgroundImages = [];
                if (parsed.backgroundImages.some((img: any) => typeof img !== 'object' || !img.url || !img.hint)) {
                    parsed.backgroundImages = []; // Reset if malformed
                }
                if (typeof parsed.minZoom !== 'number') parsed.minZoom = -2;

                if (!Array.isArray(parsed.legendSections) || parsed.legendSections.length === 0) {
                    parsed.legendSections = initialLegend;
                }

                if(isMounted) setSettings(prev => ({...prev, ...parsed}));
            }

            // Load large items from IndexedDB
            const logoBlob = await dbGet<Blob>('customLogo');
            
            if (logoBlob) currentLargeItems.customLogo = URL.createObjectURL(logoBlob);
            
            if(isMounted) setLargeItems(currentLargeItems);

            const savedShuffleTime = localStorage.getItem('rdr2-last-shuffle');
            if (savedShuffleTime) {
              if(isMounted) setLastShuffleTime(parseInt(savedShuffleTime, 10));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            if(isMounted) setIsLoaded(true);
        }
    };
    loadSettings();
    
    // Cleanup object URLs on unmount
    return () => {
      isMounted = false;
      if (currentLargeItems.customLogo) URL.revokeObjectURL(currentLargeItems.customLogo);
    }
  }, []);

  // Save small settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('rdr2-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
    }
  }, [settings, isLoaded]);
  
  // Save shuffle time to localStorage
  useEffect(() => {
    if (isLoaded && lastShuffleTime !== null) {
        try {
            localStorage.setItem('rdr2-last-shuffle', lastShuffleTime.toString());
        } catch (error) {
            console.error('Failed to save shuffle time to localStorage', error);
        }
    }
  }, [lastShuffleTime, isLoaded]);

  const addImage = (image: CustomImage) => {
    if (settings.backgroundImages.length < 10 && !settings.backgroundImages.find(i => i.url === image.url)) {
        setSettings(prev => ({ ...prev, backgroundImages: [...prev.backgroundImages, image]}));
    }
  };

  const removeImage = (url: string) => {
    setSettings(prev => ({ ...prev, backgroundImages: prev.backgroundImages.filter(img => img.url !== url)}));
  };

  const updateShuffleFrequency = (frequency: ShuffleFrequency) => {
    setSettings(prev => ({ ...prev, shuffleFrequency: frequency }));
  };

  const updateBackgroundBlur = (blur: number) => {
    setSettings(prev => ({ ...prev, backgroundBlur: blur }));
  }

  const updateMinZoom = (zoom: number) => {
    setSettings(prev => ({ ...prev, minZoom: zoom }));
  };

  const updateCustomLogo = useCallback(async (file: File | null) => {
    try {
        setLargeItems(prev => {
            if (prev.customLogo) URL.revokeObjectURL(prev.customLogo);
            return {...prev, customLogo: null};
        });

        if (file) {
            await dbSet('customLogo', file);
            setLargeItems(prev => ({...prev, customLogo: URL.createObjectURL(file)}));
        } else {
            await dbDel('customLogo');
        }
    } catch (error) {
        console.error('Failed to update custom logo:', error);
    }
  }, []);
  
  const toggleDefaultTheme = (useDefault: boolean) => {
    setSettings(prev => ({ ...prev, useDefaultTheme: useDefault }));
  };

  const forceShuffle = () => {
    setLastShuffleTime(0);
  };


  // Legend Management
  const addLegendSection = (name: string, icon: string) => {
    const newSection: LegendSection = {
        id: `section-${Date.now()}`,
        name,
        icon,
        items: []
    };
    setSettings(prev => ({ ...prev, legendSections: [...prev.legendSections, newSection] }));
  };

  const updateLegendSection = (sectionId: string, name: string, icon: string) => {
    setSettings(prev => ({
        ...prev,
        legendSections: prev.legendSections.map(section => 
            section.id === sectionId ? { ...section, name, icon } : section
        )
    }));
  };

  const deleteLegendSection = (sectionId: string) => {
    setSettings(prev => ({
        ...prev,
        legendSections: prev.legendSections.filter(section => section.id !== sectionId)
    }));
  };

  const addLegendItem = (sectionId: string, item: Omit<LegendItem, 'id'>) => {
    const newItem: LegendItem = { ...item, id: `item-${Date.now()}` };
    setSettings(prev => ({
        ...prev,
        legendSections: prev.legendSections.map(section => {
            if (section.id === sectionId) {
                return { ...section, items: [...section.items, newItem] };
            }
            return section;
        })
    }));
  };

  const updateLegendItem = (sectionId: string, itemId: string, updatedItem: LegendItem) => {
    setSettings(prev => ({
        ...prev,
        legendSections: prev.legendSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.map(item => item.id === itemId ? updatedItem : item)
                };
            }
            return section;
        })
    }));
  };

  const deleteLegendItem = (sectionId: string, itemId: string) => {
    setSettings(prev => ({
        ...prev,
        legendSections: prev.legendSections.map(section => {
            if (section.id === sectionId) {
                return { ...section, items: section.items.filter(item => item.id !== itemId) };
            }
            return section;
        })
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, largeItems, isLoaded, lastShuffleTime, setLastShuffleTime, addImage, removeImage, updateShuffleFrequency, updateBackgroundBlur, updateCustomLogo, toggleDefaultTheme, forceShuffle, updateMinZoom, addLegendSection, updateLegendSection, deleteLegendSection, addLegendItem, updateLegendItem, deleteLegendItem }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

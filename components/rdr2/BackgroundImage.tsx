
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import imageData from '@/lib/placeholder-images.json';
import { useSettings } from '@/context/SettingsContext';

const { placeholderImages } = imageData;

const BackgroundImage = () => {
  const { settings, lastShuffleTime, setLastShuffleTime, isLoaded } = useSettings();
  const [currentImage, setCurrentImage] = useState<any>(null);
  const { theme: activeTheme } = useTheme();
  const isInitialLoad = useRef(true);

  const selectRandomImage = useCallback(() => {
    const imageList = settings.backgroundImages.length > 0 
      ? settings.backgroundImages
      : placeholderImages;

    if (imageList.length === 0) return null;
    
    let newImage = imageList[Math.floor(Math.random() * imageList.length)];
    // Ensure we get a different image if possible, but don't get stuck in a loop if there's only one image.
    if (imageList.length > 1 && currentImage && newImage.url === currentImage.url) {
      for (let i = 0; i < 5; i++) { // Try up to 5 times to get a different image
        newImage = imageList[Math.floor(Math.random() * imageList.length)];
        if (newImage.url !== currentImage.url) break;
      }
    }
    return newImage;
  }, [settings.backgroundImages, currentImage]);

  useEffect(() => {
    if (!isLoaded || settings.useDefaultTheme) {
        setCurrentImage(null);
        return;
    }

    const now = Date.now();
    let shouldShuffle = false;
  
    if (lastShuffleTime === 0) { 
      shouldShuffle = true;
    } else {
      const getInterval = () => {
        switch (settings.shuffleFrequency) {
          case '30s': return 30 * 1000;
          case '60s': return 60 * 1000;
          case '3min': return 3 * 60 * 1000;
          case '5min': return 5 * 60 * 1000;
          case '10min': return 10 * 60 * 1000;
          case '15min': return 15 * 60 * 1000;
          case 'hourly': return 60 * 60 * 1000;
          case '12h': return 12 * 60 * 60 * 1000;
          case 'daily': return 24 * 60 * 60 * 1000;
          case 'pageload':
          default:
             return 0; // shuffle on load
        }
      };
  
      const interval = getInterval();
  
      if (isInitialLoad.current) {
        if (!lastShuffleTime || (interval > 0 && (now - lastShuffleTime) >= interval)) {
          shouldShuffle = true;
        }
        isInitialLoad.current = false;
      } else if (interval > 0) {
        const timeSinceShuffle = now - (lastShuffleTime || 0);
        if (timeSinceShuffle >= interval) {
          shouldShuffle = true;
        }
      }
    }
    
    if (shouldShuffle) {
        const randomImage = selectRandomImage();
        setCurrentImage(randomImage);
        setLastShuffleTime(now);
    } else if (!currentImage) {
        setCurrentImage(selectRandomImage());
    }
  
  }, [isLoaded, settings.useDefaultTheme, settings.shuffleFrequency, settings.backgroundImages, lastShuffleTime, selectRandomImage, setLastShuffleTime, currentImage]);

  useEffect(() => {
    const root = document.documentElement;
    const defaultLightPrimary = '0 100% 27%';
    const defaultLightAccent = '51 100% 50%';
    const defaultDarkPrimary = '0 100% 35%';
    const defaultDarkAccent = '51 100% 60%';

    if (settings.useDefaultTheme) {
        if (activeTheme === 'dark') {
            root.style.setProperty('--primary-hsl', defaultDarkPrimary);
            root.style.setProperty('--accent-hsl', defaultDarkAccent);
        } else {
            root.style.setProperty('--primary-hsl', defaultLightPrimary);
            root.style.setProperty('--accent-hsl', defaultLightAccent);
        }
    } else if (currentImage && activeTheme) {
      const mode = activeTheme === 'dark' ? 'dark' : 'light';
      const themeSource = currentImage.theme ? currentImage : placeholderImages[0];
      const themeColors = themeSource.theme[mode];
      
      root.style.setProperty('--primary-hsl', themeColors.primary);
      root.style.setProperty('--accent-hsl', themeColors.accent);
    }
  }, [currentImage, activeTheme, settings.useDefaultTheme]);
  
  if (settings.useDefaultTheme || !currentImage) {
    return (
      <div 
        className="fixed inset-0 z-0 transition-colors"
        style={{ backgroundColor: 'hsl(var(--background-opaque))' }}
      />
    );
  }

  const blurAmount = settings.backgroundBlur * 2;

  return (
    <div className="fixed inset-0 z-0">
        <Image
          key={currentImage.url}
          src={currentImage.url}
          alt="Red Dead Redemption 2 inspired background"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          className="opacity-50"
          priority
          data-ai-hint={currentImage.hint}
          onError={() => {
            console.warn(`Failed to load image: ${currentImage.url}. Falling back to placeholder.`);
            setCurrentImage(placeholderImages[0])
          }}
        />
      <div 
        className="absolute inset-0 bg-background/50 backdrop-blur-sm transition-all duration-500" 
        style={{ backdropFilter: `blur(${blurAmount}px)` }}
      />
    </div>
  );
};

export default BackgroundImage;

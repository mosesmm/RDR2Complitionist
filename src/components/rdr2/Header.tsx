
'use client';

import Rdr2Logo from '@/components/icons/Rdr2Logo';
import { ThemeSwitcher } from './ThemeSwitcher';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Settings, ArrowLeft, RefreshCw, Map as MapIcon } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { largeItems, isLoaded, forceShuffle } = useSettings();
  const pathname = usePathname();

  const isHomePage = pathname === '/';
  const isMapPage = pathname === '/map';
  const isSettingsPage = pathname === '/settings';
  const isMapSettingsPage = pathname === '/map/settings';


  return (
    <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-4">
            {isLoaded && largeItems.customLogo ? (
                 <Image
                    src={largeItems.customLogo}
                    alt="Custom App Logo"
                    width={150}
                    height={40}
                    className="object-contain"
                    priority
                 />
            ) : (
                <>
                    <Rdr2Logo />
                    <h1 className="font-headline text-3xl md:text-4xl text-primary">RDR2 Completionist</h1>
                </>
            )}
        </Link>
        <div className="flex items-center gap-2">
            {isHomePage && (
              <>
                <Link href="/map" passHref>
                  <Button variant="outline" size="icon" aria-label="Map">
                    <MapIcon className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </Link>
                <Link href="/settings" passHref>
                  <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </Link>
              </>
            )}
            
            {isMapPage && (
                 <Link href="/map/settings" passHref>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" /> Map Settings
                    </Button>
                  </Link>
            )}

            {(isMapPage || isMapSettingsPage || isSettingsPage) && (
              <Button variant="outline" size="icon" aria-label="Shuffle Background" onClick={forceShuffle}>
                <RefreshCw className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            )}
            
            {isSettingsPage && (
                <Link href="/" passHref>
                    <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
            )}

            {isMapSettingsPage && (
                <Link href="/map" passHref>
                    <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Map
                    </Button>
                </Link>
            )}

            {(isMapPage) && (
              <Link href="/" passHref>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
            )}

          <ThemeSwitcher />
        </div>
    </header>
  );
};

export default Header;

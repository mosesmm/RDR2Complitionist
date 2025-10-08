

'use client';

import React, { useState, useMemo, ReactElement, useEffect } from 'react';
import Image from 'next/image';
import { isUrl } from '@/lib/map-icon-helpers';
import { SvgIcon } from '@/lib/map-icon-helpers';

export const IconPreview = ({ icon: iconIdentifier }: { icon: string }) => {
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const [iconPaths, setIconPaths] = useState<string[] | null>(null);

    useEffect(() => {
        if (!iconIdentifier) {
            setIconUrl(null);
            setIconPaths(null);
            return;
        }

        if (isUrl(iconIdentifier)) {
            setIconUrl(iconIdentifier);
            setIconPaths(null);
        } else {
             setIconUrl(null);
             setIconPaths(null);
        }
    }, [iconIdentifier]);
    

    if (iconUrl) {
      return <Image src={iconUrl} alt="icon preview" width={24} height={24} className="object-contain" />;
    }

    if (iconPaths) {
        return <SvgIcon paths={iconPaths} className="h-6 w-6" />
    }
    
    // Fallback for emojis
    if (typeof iconIdentifier === 'string') {
      return <span className="text-xl">{iconIdentifier}</span>;
    }

    return <span className="text-xl">📍</span>;
};

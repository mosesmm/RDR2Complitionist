
'use client';

import { useState } from 'react';
import { useSettings, CustomImage } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Trash2, PlusCircle, Upload, Map } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/rdr2/Header';
import React from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const frequencyMap: { [key: number]: string } = {
  0: 'On Every Page Load', 1: 'Every 30 Seconds', 2: 'Every 60 Seconds',
  3: 'Every 3 Minutes', 4: 'Every 5 Minutes', 5: 'Every 10 Minutes',
  6: 'Every 15 Minutes', 7: 'Hourly', 8: 'Every 12 Hours', 9: 'Daily',
};
const valueMap: { [key: string]: number } = {
  'pageload': 0, '30s': 1, '60s': 2, '3min': 3, '5min': 4,
  '10min': 5, '15min': 6, 'hourly': 7, '12h': 8, 'daily': 9
};
const frequencyValues = ['pageload', '30s', '60s', '3min', '5min', '10min', '15min', 'hourly', '12h', 'daily'];

const NewImageForm = ({ onAdd, disabled }: { onAdd: (image: CustomImage) => void, disabled: boolean }) => {
    const [url, setUrl] = useState('');

    const handleAdd = () => {
        if (url) {
            onAdd({ url, hint: 'custom' });
            setUrl('');
        }
    };

    return (
        <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-semibold">Add New Image</h4>
            <Input type="url" placeholder="https://... or data:image/..." value={url} onChange={(e) => setUrl(e.target.value)} disabled={disabled} />
            <Button onClick={handleAdd} disabled={!url || disabled}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Image
            </Button>
        </div>
    );
};


export default function SettingsPage() {
  const { settings, largeItems, addImage, removeImage, updateShuffleFrequency, updateBackgroundBlur, updateCustomLogo, toggleDefaultTheme, isLoaded } = useSettings();
  const { toast } = useToast();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({
                title: 'File Too Large',
                description: 'Please upload a logo image smaller than 10MB.',
                variant: 'destructive',
            });
            return;
        }
        updateCustomLogo(file);
    }
  };

  const sliderValue = isLoaded ? valueMap[settings.shuffleFrequency] ?? 0 : 0;
  const blurValue = isLoaded ? settings.backgroundBlur ?? 0 : 0;
  
  if (!isLoaded) return <div>Loading settings...</div>;

  return (
    <div className="flex min-h-screen flex-col">
       <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Custom Logo</CardTitle>
                    <CardDescription>Upload a logo for the header (max 10MB). Uploading a new one will overwrite the current one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        <Label htmlFor="logo-upload" className="flex-1">
                            <Button asChild className="w-full cursor-pointer"><div className="flex items-center"><Upload className="mr-2" /> Upload Logo</div></Button>
                        </Label>
                    </div>
                    {largeItems.customLogo && (
                        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border p-2">
                            <Image src={largeItems.customLogo} alt="Custom logo preview" width={128} height={36} className="rounded-md object-contain" />
                            <span className="truncate text-sm text-muted-foreground">Custom logo uploaded</span>
                            <Button variant="ghost" size="icon" onClick={() => updateCustomLogo(null)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme &amp; Background</CardTitle>
                    <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="theme-switch" className="flex flex-col space-y-1">
                            <span>Use Default Theme</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Use the classic, non-transparent theme.
                            </span>
                        </Label>
                        <Switch
                            id="theme-switch"
                            checked={settings.useDefaultTheme}
                            onCheckedChange={toggleDefaultTheme}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Background Images</CardTitle>
                    <CardDescription>Add up to 10 images. These will override default images. Requires "Use Default Theme" to be off.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <fieldset disabled={settings.useDefaultTheme}>
                        <NewImageForm onAdd={addImage} disabled={settings.useDefaultTheme} />
                        <div className="mt-4 space-y-2">
                            {settings.backgroundImages.map((image) => (
                                <div key={image.url} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border p-2">
                                    <Image src={image.url} alt="preview" width={96} height={54} className="rounded-md object-cover" />
                                    <p className="truncate text-xs text-muted-foreground">{image.url}</p>
                                    <Button variant="ghost" size="icon" onClick={() => removeImage(image.url)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        {settings.backgroundImages.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No custom images added.</p>}
                    </fieldset>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shuffle Frequency</CardTitle>
                    <CardDescription>How often should the background image change?</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <Slider disabled={settings.useDefaultTheme} value={[sliderValue]} onValueChange={(value) => updateShuffleFrequency(frequencyValues[value[0]] as any)} max={9} step={1} />
                    <p className="text-center text-sm font-medium text-muted-foreground mt-2">{frequencyMap[sliderValue]}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Background Blur</CardTitle>
                    <CardDescription>Adjust the blur effect on the background image.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <Slider disabled={settings.useDefaultTheme} value={[blurValue]} onValueChange={(value) => updateBackgroundBlur(value[0])} max={16} step={1} />
                    <p className="text-center text-sm font-medium text-muted-foreground mt-2">Blur radius: {blurValue * 2}px</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

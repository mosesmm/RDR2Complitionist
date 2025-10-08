

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSettings, LegendItem, LegendSection } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Trash2, PlusCircle, Upload, Map as MapIcon, Settings as SettingsIcon, ArrowLeft, Crosshair, Pencil, Smile, Info } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/rdr2/Header';
import React from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { IconPreview } from '@/components/rdr2/IconPicker';


const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const MapSettings = () => {
    const { settings, updateMinZoom, isLoaded } = useSettings();
  
    const minZoomValue = isLoaded ? settings.minZoom ?? -2 : -2;
  
    if (!isLoaded) return <div>Loading settings...</div>;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Map Minimum Zoom</CardTitle>
                    <CardDescription>Adjust how far you can zoom out on the map. Lower is more zoomed out.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <Slider value={[minZoomValue]} onValueChange={(value) => updateMinZoom(value[0])} min={-5} max={0} step={1} />
                    <p className="text-center text-sm font-medium text-muted-foreground mt-2">Zoom Level: {minZoomValue}</p>
                </CardContent>
            </Card>
        </div>
    )
}

const EditItemDialog = ({ sectionId, item, trigger }: { sectionId: string, item: LegendItem, trigger: React.ReactNode }) => {
    const { updateLegendItem } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(item.name);
    const [x, setX] = useState(item.x.toString());
    const [y, setY] = useState(item.y.toString());

    const isEditingThisItem = useMemo(() => {
        return searchParams.get('editing') === item.id;
    }, [searchParams, item.id]);

    useEffect(() => {
        if (isEditingThisItem) {
            const newX = searchParams.get('x');
            const newY = searchParams.get('y');
            if (newX && newY) {
                setX(parseFloat(newX).toFixed(2));
                setY(parseFloat(newY).toFixed(2));
                // Clean up URL params
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete('x');
                newParams.delete('y');
                newParams.delete('editing');
                router.replace(`/map/settings?${newParams.toString()}`);
            }
            setIsOpen(true);
        }
    }, [isEditingThisItem, searchParams, router, item.id]);


    const handleSave = () => {
        const updatedItem: LegendItem = {
            ...item,
            name,
            x: parseFloat(x) || 0,
            y: parseFloat(y) || 0,
        };
        updateLegendItem(sectionId, item.id, updatedItem);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Legend Item</DialogTitle>
                    <DialogDescription>
                        Update the details for this map marker.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="x-coord" className="text-right">X %</Label>
                        <Input id="x-coord" type="number" value={x} onChange={(e) => setX(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="y-coord" className="text-right">Y %</Label>
                        <Input id="y-coord" type="number" value={y} onChange={(e) => setY(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                     <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/map?selectPoint=true&editing=${item.id}&tab=legend`}>
                            <Crosshair className="mr-2 h-4 w-4" /> Select on Map
                        </Link>
                    </Button>
                    <Button type="submit" onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EditSectionDialog = ({ section, trigger }: { section: LegendSection, trigger: React.ReactNode }) => {
    const { updateLegendSection } = useSettings();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(section.name);
    const [icon, setIcon] = useState<string>(section.icon);
    
    const handleSave = () => {
        if (name) {
            updateLegendSection(section.id, name, icon || '📍');
            setIsOpen(false);
        }
    };

    const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024) { // 100KB limit for icons
                toast({
                    title: "Icon File Too Large",
                    description: "Please upload an icon smaller than 100KB.",
                    variant: "destructive",
                });
                return;
            }
            const dataUrl = await fileToDataUrl(file);
            setIcon(dataUrl);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="section-name">Name</Label>
                        <Input id="section-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="flex items-center gap-2">
                           <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Enter an emoji..." />
                           <Input id="icon-upload-edit" type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                           <Label htmlFor="icon-upload-edit">
                                <Button asChild variant="outline" className="cursor-pointer"><div className="flex items-center"><Upload className="mr-2 h-4 w-4" /> Upload</div></Button>
                           </Label>
                           {icon && <IconPreview icon={icon} />}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const LegendManager = () => {
    const { settings, addLegendSection, deleteLegendSection, addLegendItem, deleteLegendItem } = useSettings();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [newItemData, setNewItemData] = useState<Record<string, {name: string, x: string, y: string}>>({});

    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionIcon, setNewSectionIcon] = useState<string>('📍');

     const handleNewItemChange = (sectionId: string, field: 'name' | 'x' | 'y', value: string) => {
        setNewItemData(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId] || { name: '', x: '', y: '' },
                [field]: value
            }
        }));
    };

    useEffect(() => {
        const x = searchParams.get('x');
        const y = searchParams.get('y');
        const name = searchParams.get('name');
        const sectionId = searchParams.get('sectionId');
        const isAdding = searchParams.get('adding') === 'true';

        if (isAdding && sectionId && x && y) {
            handleNewItemChange(sectionId, 'x', parseFloat(x).toFixed(2));
            handleNewItemChange(sectionId, 'y', parseFloat(y).toFixed(2));
            if (name) handleNewItemChange(sectionId, 'name', name);
            
             // Clean up URL params
             const newParams = new URLSearchParams(searchParams.toString());
             newParams.delete('x');
             newParams.delete('y');
             newParams.delete('name');
             newParams.delete('adding');
             newParams.delete('sectionId');
             router.replace(`/map/settings?${newParams.toString()}`);
        }
    }, [searchParams, router]);

    const handleAddItem = (sectionId: string) => {
        const item = newItemData[sectionId] || { name: '', x: '', y: '' };
        if (!item.name || !item.x || !item.y) {
            toast({ title: 'Missing Information', description: 'Please fill out the name and coordinates.', variant: 'destructive'});
            return;
        }
        addLegendItem(sectionId, {
            name: item.name,
            x: parseFloat(item.x),
            y: parseFloat(item.y),
        });
        
        setNewItemData(prev => ({
            ...prev,
            [sectionId]: { name: '', x: '', y: '' }
        }));
    };

    const handleAddSection = () => {
        if (!newSectionName) {
            toast({ title: 'Missing Name', description: 'Please provide a name for the new section.', variant: 'destructive'});
            return;
        }
        addLegendSection(newSectionName, newSectionIcon);
        setNewSectionName('');
        setNewSectionIcon('📍');
    }

    const handleNewSectionIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024) { // 100KB limit for icons
                toast({
                    title: "Icon File Too Large",
                    description: "Please upload an icon smaller than 100KB.",
                    variant: "destructive",
                });
                return;
            }
            const dataUrl = await fileToDataUrl(file);
            setNewSectionIcon(dataUrl);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Legend</CardTitle>
                    <CardDescription>Add, edit, or remove sections and items on your map.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full" defaultValue={settings.legendSections.map(s => `section-${s.id}`)}>
                        {settings.legendSections.map(section => {
                            const currentNewItem = newItemData[section.id] || { name: '', x: '', y: '' };
                            return (
                                <AccordionItem value={`section-${section.id}`} key={section.id}>
                                    <div className="flex items-center w-full">
                                        <AccordionTrigger className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <IconPreview icon={section.icon} />
                                                <span className="truncate mr-4">{section.name}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <div className="flex items-center gap-1 pr-2">
                                            <EditSectionDialog section={section} trigger={
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                                            } />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the <strong>{section.name}</strong> section and all items within it.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteLegendSection(section.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    <AccordionContent>
                                        <div className="space-y-2">
                                            {section.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 rounded-md border p-2">
                                                    <span className="flex-1 font-medium truncate">{item.name}</span>
                                                    <span className="text-sm text-muted-foreground">X: {item.x.toFixed(2)}%, Y: {item.y.toFixed(2)}%</span>
                                                    
                                                    <EditItemDialog sectionId={section.id} item={item} trigger={
                                                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                                    } />
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete the <strong>{item.name}</strong> item? This cannot be undone.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteLegendItem(section.id, item.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ))}
                                            {section.items.length === 0 && (
                                                <p className="text-center text-sm text-muted-foreground py-4">No items in this section yet.</p>
                                            )}
                                            <div className="space-y-2 rounded-md border border-dashed p-4">
                                                <h4 className="font-semibold">Add New Item to {section.name}</h4>
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                    <Input placeholder="Name" value={currentNewItem.name} onChange={(e) => handleNewItemChange(section.id, 'name', e.target.value)} />
                                                    <Input type="number" placeholder="X %" value={currentNewItem.x} onChange={(e) => handleNewItemChange(section.id, 'x', e.target.value)} />
                                                    <Input type="number" placeholder="Y %" value={currentNewItem.y} onChange={(e) => handleNewItemChange(section.id, 'y', e.target.value)} />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button onClick={() => handleAddItem(section.id)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                                    </Button>
                                                    <Button asChild variant="outline">
                                                        <Link href={`/map?selectPoint=true&name=${encodeURIComponent(currentNewItem.name)}&adding=true&sectionId=${section.id}&tab=legend`}>
                                                            <Crosshair className="mr-2 h-4 w-4" /> Select on Map
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                     <div className="mt-4 space-y-2 rounded-md border border-dashed p-4">
                        <h4 className="font-semibold">Add New Section</h4>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                            <Input placeholder="New Section Name (e.g., Collectibles)" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} />
                            <div className="flex items-center gap-2">
                                <Input placeholder="Icon (Emoji or upload)" value={newSectionIcon} onChange={e => setNewSectionIcon(e.target.value)} className="w-full md:w-auto"/>
                                <Input id="icon-upload-new" type="file" accept="image/*" onChange={handleNewSectionIconUpload} className="hidden" />
                                <Label htmlFor="icon-upload-new">
                                    <Button asChild variant="outline" className="cursor-pointer"><div className="flex items-center"><Upload className="mr-2 h-4 w-4" /></div></Button>
                                </Label>
                                {newSectionIcon && <IconPreview icon={newSectionIcon} />}
                            </div>
                        </div>
                        <Button onClick={handleAddSection}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Section
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function MapSettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'legend';
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
       <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl text-primary">Map Settings</h1>
            </div>
            <Tabs defaultValue={defaultTab} value={defaultTab} onValueChange={(value) => router.push(`?tab=${value}`)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="legend" className="w-full"><MapIcon className="mr-2" /> Legend Items</TabsTrigger>
                    <TabsTrigger value="settings" className="w-full"><SettingsIcon className="mr-2" /> Map Config</TabsTrigger>
                </TabsList>
                <TabsContent value="legend" className="pt-6">
                    <LegendManager />
                </TabsContent>
                <TabsContent value="settings" className="pt-6">
                    <MapSettings />
                </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}

    
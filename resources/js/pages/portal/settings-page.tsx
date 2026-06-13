import Dropzone from '@/components/custom/dropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBrandAssets } from '@/hooks/use-brand-assets';
import AppLayout from '@/layouts/app-layout';
import { ImagePlus, Info, Save } from 'lucide-react';
import { useState } from 'react';

const imageAccept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'],
};

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function AssetLabel({ children, tooltip }: { children: string; tooltip: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <Tooltip open={open}>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        aria-expanded={open}
                        aria-pressed={open}
                        onClick={() => setOpen((current) => !current)}
                        className="size-5 cursor-pointer rounded-full border-border bg-background p-0 shadow-sm"
                    >
                        <Info className="size-3.5" />
                        <span className="sr-only">{children} info</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    align="start"
                    className="max-w-72 rounded-md border border-border bg-background px-4 py-3 text-sm leading-5 text-foreground shadow-md"
                >
                    {tooltip}
                </TooltipContent>
            </Tooltip>
            <span>{children}</span>
        </div>
    );
}

export default function SettingsPage() {
    const { favicon, logo, setAsset } = useBrandAssets();

    const uploadAsset = async (key: 'logo' | 'favicon', files: File[]) => {
        const file = files[0];

        if (!file) {
            return;
        }

        setAsset(key, await readFileAsDataUrl(file));
    };

    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        <span>System</span>
                        <span className="mx-2">›</span>
                        <span>General</span>
                        <span className="mx-2">›</span>
                        <span className="text-foreground">Settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            Active
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Settings</h1>
                    </div>
                    <Button className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500">
                        <Save className="size-4" />
                        Save
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="w-full max-w-48 space-y-2 sm:w-48">
                            <AssetLabel tooltip="Logo should be in PNG, JPG, WEBP, SVG, or ICO format and no larger than 500kb.">Website Logo</AssetLabel>
                            <Dropzone
                                accept={imageAccept}
                                onDrop={(files) => void uploadAsset('logo', files)}
                                className="relative flex aspect-square items-center justify-center rounded-lg border border-border/70 bg-background p-5 shadow-sm hover:bg-blue-50/50"
                            >
                                {logo ? (
                                    <img src={logo} alt="Website logo" className="max-h-24 max-w-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                                        <ImagePlus className="size-6" />
                                        Upload logo
                                    </div>
                                )}
                                <ImagePlus className="pointer-events-none absolute right-3 bottom-3 size-5 text-muted-foreground/45" />
                            </Dropzone>
                        </div>
                        <div className="w-full max-w-40 space-y-2 sm:w-40">
                            <AssetLabel tooltip="Favicon must be in PNG or ICO format and no larger than 500kb.">Website Favicon</AssetLabel>
                            <Dropzone
                                accept={imageAccept}
                                onDrop={(files) => void uploadAsset('favicon', files)}
                                className="flex aspect-square items-center justify-center rounded-lg border border-border/70 bg-background p-5 shadow-sm hover:bg-blue-50/50"
                            >
                                {favicon ? (
                                    <img src={favicon} alt="Website favicon" className="size-14 object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                                        <ImagePlus className="size-6" />
                                        Upload icon
                                    </div>
                                )}
                            </Dropzone>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="website-name">Website Name</Label>
                            <Input id="website-name" defaultValue="Only AI Jobs" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meta-keywords">Default Meta Keywords</Label>
                            <Input
                                id="meta-keywords"
                                defaultValue="ai jobs, artificial intelligence jobs, machine learning jobs, data science jobs, ai careers, ai jobs europe, machine learning jobs europe, data scientist jobs, ai engineer jobs, deep learning jobs, tech jobs europe, onlyaijobs"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meta-description">Default Meta Description</Label>
                            <Textarea
                                id="meta-description"
                                className="min-h-36"
                                rows={6}
                                defaultValue="OnlyAIJobs connects AI talents with top European companies. Find your perfect AI job or find your perfect new AI colleague today!"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

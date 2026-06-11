import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImagePlus, Info, Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-hidden p-4">
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
                    <Button className="gap-2">
                        <Save className="size-4" />
                        Save
                    </Button>
                </div>

                <Card className="rounded-xl border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Brand assets and metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Info className="size-4" />
                                    Website Logo
                                </div>
                                <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                                    <img
                                        src="/logo.png"
                                        alt="Website logo"
                                        className="max-h-28 max-w-[85%] object-contain"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <ImagePlus className="absolute size-8 text-muted-foreground/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Info className="size-4" />
                                    Website Favicon
                                </div>
                                <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                                    <div className="flex size-16 items-center justify-center rounded-full bg-purple-500 text-lg font-semibold text-white">
                                        AI
                                    </div>
                                </div>
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
                                    rows={7}
                                    defaultValue="OnlyAIJobs connects AI talents with top European companies. Find your perfect AI job or find your perfect new AI colleague today!"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

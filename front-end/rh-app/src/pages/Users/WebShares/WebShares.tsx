"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    MoreHorizontal,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Share {
    id: number;
    logo: string;
    name: string;
    price: number;
    sector: string;
    label: "Hot Selling" | "Promising";
    status: "Listed" | "Unlisted";
    action?: string;
}

const dummyShares: Share[] = [
    {
        id: 1,
        logo: "https://picsum.photos/seed/1/40/40",
        name: "TechNova Corp",
        price: 150.25,
        sector: "Technology",
        label: "Hot Selling",
        status: "Listed",
    },
    {
        id: 2,
        logo: "https://picsum.photos/seed/2/40/40",
        name: "GreenEnergy Ltd",
        price: 45.1,
        sector: "Energy",
        label: "Promising",
        status: "Unlisted",
    },
    {
        id: 3,
        logo: "https://picsum.photos/seed/3/40/40",
        name: "HealthPlus",
        price: 210.5,
        sector: "Healthcare",
        label: "Hot Selling",
        status: "Listed",
    },
    {
        id: 4,
        logo: "https://picsum.photos/seed/4/40/40",
        name: "FinanceFlow",
        price: 89.9,
        sector: "Finance",
        label: "Promising",
        status: "Listed",
    },
    {
        id: 5,
        logo: "https://picsum.photos/seed/5/40/40",
        name: "UrbanBuild",
        price: 32.4,
        sector: "Real Estate",
        label: "Promising",
        status: "Unlisted",
    },
];

export default function WebShares() {
    const [shares, setShares] = useState<Share[]>(dummyShares);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // States for the form
    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formSector, setFormSector] = useState("");
    const [formLogo, setFormLogo] = useState("");
    const [inputType, setInputType] = useState<"url" | "upload">("url");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredShares = shares.filter((share) =>
        share.name.toLowerCase().includes(search.toLowerCase())
    );

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shareToDelete, setShareToDelete] = useState<Share | null>(null);

    const openAddDialog = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormName("");
        setFormPrice("");
        setFormSector("");
        setFormLogo("");
        setDialogOpen(true);
    };

    const openEditDialog = (share: Share) => {
        setIsEditing(true);
        setCurrentId(share.id);
        setFormName(share.name);
        setFormPrice(share.price.toString());
        setFormSector(share.sector);
        setFormLogo(share.logo);
        // Timeout to prevent pointer-events issues with Radix Dialog + Dropdown
        setTimeout(() => setDialogOpen(true), 0);
    };

    const handleDeleteClick = (share: Share) => {
        setShareToDelete(share);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (shareToDelete) {
            setShares(shares.filter((s) => s.id !== shareToDelete.id));
            toast.success("Share deleted successfully");
            setDeleteDialogOpen(false);
            setShareToDelete(null);
        }
    };

    const handleSave = () => {
        if (!formName || !formPrice || !formSector) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (isEditing && currentId !== null) {
            // Update existing
            const updatedShares = shares.map((s) =>
                s.id === currentId
                    ? {
                        ...s,
                        name: formName,
                        price: parseFloat(formPrice) || 0,
                        sector: formSector,
                        logo: formLogo || `https://picsum.photos/seed/${s.id}/40/40`,
                    }
                    : s
            );
            setShares(updatedShares);
            toast.success("Share updated successfully");
        } else {
            // Create new
            const newId = Math.max(...shares.map(s => s.id), 0) + 1;
            const newShare: Share = {
                id: newId,
                name: formName,
                price: parseFloat(formPrice) || 0,
                sector: formSector,
                logo: formLogo || `https://picsum.photos/seed/${newId}/40/40`,
                label: "Promising", // Default
                status: "Listed", // Default
            };
            setShares([...shares, newShare]);
            toast.success("New share added successfully");
        }
        setDialogOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-4.5rem)] w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative gap-6">
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="flex flex-col gap-6 p-6 max-md:p-3">
                        <div className="flex max-md:flex-col max-md:items-start gap-5 items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Web Shares</h2>
                                <p className="text-muted-foreground">
                                    Manage your web share listings
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={openAddDialog}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Share
                                </Button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Shares</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{shares.length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search shares..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Table */}
                        <div className="rounded-md border max-md:flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Sector</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredShares.length ? (
                                        filteredShares.map((share) => (
                                            <TableRow key={share.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="py-4">
                                                    <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-muted/30 border border-border overflow-hidden">
                                                        {share.logo ? (
                                                            <img
                                                                src={share.logo}
                                                                alt={share.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-xl text-muted-foreground font-bold">{share.name.charAt(0)}</span>
                                                        )}
                                                        <span className={`text-xl text-muted-foreground font-bold hidden ${(share.logo) ? '' : 'block'}`}>{share.name.charAt(0)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-base">{share.name}</TableCell>
                                                <TableCell className="font-medium text-foreground/80">₹{share.price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                        <span className="text-muted-foreground">{share.sector}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200">
                                                        {share.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        {share.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => openEditDialog(share)}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                                onClick={() => handleDeleteClick(share)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-6 shadow-xl rounded-2xl">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-semibold text-center">
                            {isEditing ? "Edit Share" : "New Share"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs text-muted-foreground hidden">
                            Make changes to your share listing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6">
                        {/* Centered Image Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="group relative">
                                <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
                                    {formLogo ? (
                                        <img
                                            src={formLogo}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-medium uppercase tracking-wider">Logo</span>
                                        </div>
                                    )}

                                    {/* Hover Overlay for Action */}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-2xl">
                                        <Edit className="h-6 w-6 mb-1" />
                                        <span className="text-xs font-medium">Change</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* URL Input Toggle */}
                            {inputType !== 'url' && (
                                <button
                                    onClick={() => setInputType('url')}
                                    className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                                >
                                    Use Image URL instead
                                </button>
                            )}

                            {inputType === 'url' && (
                                <div className="w-full relative">
                                    <Input
                                        placeholder="Paste image URL..."
                                        value={formLogo}
                                        onChange={(e) => setFormLogo(e.target.value)}
                                        className="h-8 text-xs bg-muted/50 border-none shadow-none text-center focus-visible:ring-1 focus-visible:ring-ring"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setInputType('upload')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Minimal Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Name</Label>
                                <Input
                                    id="name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring transition-all h-10"
                                    placeholder="Company Name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground ml-1">Price</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formPrice}
                                            onChange={(e) => setFormPrice(e.target.value)}
                                            className="pl-6 bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring transition-all h-10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground ml-1">Sector</Label>
                                    <Input
                                        id="sector"
                                        value={formSector}
                                        onChange={(e) => setFormSector(e.target.value)}
                                        className="bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring transition-all h-10"
                                        placeholder="Sector"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2 sm:justify-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDialogOpen(false)}
                            className="h-9 px-6 text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSave}
                            className="h-9 px-8 rounded-lg"
                        >
                            {isEditing ? "Save" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-6 shadow-xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-center text-red-600 dark:text-red-400">
                            Delete Share?
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground mt-2">
                            Are you sure you want to delete <span className="font-medium text-foreground">"{shareToDelete?.name}"</span>?
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="h-9 px-6 text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            className="h-9 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import PlatformLeadFilters from "./filters/PlatformLeadFilters";
import { ChevronRight, Users } from "lucide-react";
import { ContactList, contactService } from "@/services/contact/contactService";
import ContactListStep from "./filters/UploadedLeadsStep";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (filters: any) => Promise<void>;
  /** When true the dialog is view-only — source toggles and filter controls
   *  are inert, the Apply button is hidden, and the cancel button reads
   *  "Close". Internal local toggles are still possible but discarded on
   *  Close since onChange is never invoked. */
  readOnly?: boolean;
};

// Trimmed to the two recipient sources this build supports — platform leads
// (admin-managed leads) and uploaded contact lists (CSV imports). Event/
// resource/recording/external-lead sources are out of scope.
const SOURCES = [
  { id: "platform_leads", label: "Platform Leads" },
  { id: "contact_list", label: "Contact List" },
];

type ViewState = { type: "main" } | { type: "contact_list" };

export default function LeadSelector({
  open,
  onOpenChange,
  value,
  onChange,
  readOnly = false,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filters, setFilters] = useState<any>(value || { sources: [] });
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<ViewState>({ type: "main" });

  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [contactListsLoading, setContactListsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setContactListsLoading(true);
      try {
        const contactListsRes = await contactService.getContactLists();
        setContactLists(contactListsRes);
      } catch (err) {
        console.error("Failed to fetch contact lists", err);
      } finally {
        setContactListsLoading(false);
      }
    };

    fetchData();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const val = value || { sources: [] };

    setFilters(val);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOpenItems(val.sources?.map((s: any) => s.type) || []);

    const uploadedSource = val.sources?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.type === "contact_list",
    );
    setSelectedListIds(uploadedSource?.filters?.contactListIds || []);
  }, [value, open]);

  const isSelected = (type: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters.sources?.some((s: any) => s.type === type);

  const toggleSource = (type: string) => {
    const exists = isSelected(type);
    if (exists) {
      setFilters({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sources: filters.sources.filter((s: any) => s.type !== type),
      });
      setOpenItems((prev) => prev.filter((i) => i !== type));
    } else {
      setFilters({
        sources: [...filters.sources, { type, filters: {} }],
      });
      setOpenItems((prev) => [...prev, type]);
    }
  };

  const syncUploadedLeadsToFilters = (nextListIds: string[]) => {
    const hasUploadedSource = filters.sources.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.type === "contact_list",
    );

    const updatedSources = hasUploadedSource
      ? filters.sources.map((s: any) =>
          s.type === "contact_list"
            ? { ...s, filters: { contactListIds: nextListIds } }
            : s,
        )
      : [
          ...filters.sources,
          {
            type: "contact_list",
            filters: { contactListIds: nextListIds },
          },
        ];

    setFilters({ sources: updatedSources });
  };

  const toggleListId = (id: string) => {
    setSelectedListIds((prev) => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter((l) => l !== id) : [...prev, id];

      syncUploadedLeadsToFilters(next);
      return next;
    });
  };

  const save = async () => {
    setLoading(true);
    try {
      await onChange(filters);
    } finally {
      setLoading(false);
    }
  };

  const baseTitle =
    view.type === "main" ? "Select Lead Source" : "Uploaded Contact Lists";
  const dialogTitle = readOnly ? `${baseTitle} (view only)` : baseTitle;

  const dialogDescription = readOnly
    ? "Sources currently feeding this campaign. To change them, edit the campaign."
    : view.type === "main"
      ? "Enable lead sources and configure filters to choose recipients."
      : "Select one or more contact lists to include as campaign recipients.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">{dialogDescription}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          {/* Main view */}
          {view.type === "main" && (
            <div className="space-y-1">
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={(v) => setOpenItems(v)}
                className="w-full"
              >
                {SOURCES.map((source) => {
                  const selected = isSelected(source.id);
                  return (
                    <AccordionItem key={source.id} value={source.id}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                          selected ? "bg-muted/40" : ""
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleSource(source.id)}
                          disabled={readOnly}
                        />
                        <AccordionTrigger className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold cursor-pointer">
                              {source.label}
                            </Label>
                          </div>
                        </AccordionTrigger>
                      </div>

                      <AccordionContent className="px-5">
                        {!selected && (
                          <div className="text-sm text-muted-foreground py-3 px-4">
                            Enable this source to configure filters
                          </div>
                        )}
                        {selected && (
                          <div className="space-y-4 pt-2">
                            {source.id === "platform_leads" && (
                              <div
                                className={
                                  readOnly
                                    ? "pointer-events-none opacity-70"
                                    : ""
                                }
                              >
                                <PlatformLeadFilters
                                  value={
                                    filters.sources.find(
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      (s: any) => s.type === "platform_leads",
                                    )?.filters
                                  }
                                  onChange={(val) => {
                                    const updated = filters.sources.map(
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      (s: any) =>
                                        s.type === "platform_leads"
                                          ? { ...s, filters: val }
                                          : s,
                                    );
                                    setFilters({ sources: updated });
                                  }}
                                />
                              </div>
                            )}

                            {source.id === "contact_list" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setView({ type: "contact_list" })
                                }
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                    Select Contact Lists
                                  </span>
                                  {selectedListIds.length > 0 ? (
                                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
                                      {selectedListIds.length} list
                                      {selectedListIds.length > 1
                                        ? "s"
                                        : ""}{" "}
                                      selected
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      Click to choose contact lists
                                    </span>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </button>
                            )}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}

          {view.type === "contact_list" && (
            <div className={readOnly ? "pointer-events-none opacity-70" : ""}>
              <ContactListStep
                contactLists={contactLists}
                loading={contactListsLoading}
                selectedListIds={selectedListIds}
                onToggleList={toggleListId}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          {view.type !== "main" && (
            <Button
              variant="ghost"
              className="mr-auto"
              onClick={() => setView({ type: "main" })}
            >
              ← Back
            </Button>
          )}

          {readOnly ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={loading}>
                {loading ? "Applying..." : "Apply"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

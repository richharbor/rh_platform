import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, MapPin, FileText, Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

interface ApplicationDialogProps {
  isFetching: boolean
  open: boolean;
  onClose: (open: boolean) => void;
  data: any;
  userProfile?: string;
}

export default function ApplicationDialog({ open, onClose, data, isFetching, userProfile }: ApplicationDialogProps) {
  if (isFetching) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full" />
            <p className="text-sm text-muted-foreground font-medium">Loading partner details...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  if (!data) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-10 w-10 flex items-center justify-center text-destructive">
              ❌
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Unable to fetch super admin data.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const step1 = data.formData?.step1 || {}
  const step2 = data.formData?.step2 || {}
  const referrals = data.formData?.step5 || []

  const location = [step2.addressLine1, step2.city, step2.state, step2.country, step2.zipCode]
    .filter(Boolean)
    .join(", ")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {userProfile} - {step1.fullName || "Partner Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Partner Information & Referrals</p>
            </div>

          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{step1.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Mobile</p>
                    <p className="text-sm font-medium text-foreground">{data.user?.phoneNumber || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Location</p>
                    <p className="text-sm font-medium text-foreground">{step1.location || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border ">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">firm Name</p>
                    <p className="text-sm font-medium text-foreground">{step1.firmName || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border ">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Entity Type</p>
                    <p className="text-sm font-medium text-foreground">{step1.category || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Documentation</h3>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Aadhar Card</p>
                  <p className="text-sm font-medium text-foreground">{step2.aadharCard || "—"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Referrals</h3>
                <Badge variant="outline" className="ml-auto">
                  {referrals.length}
                </Badge>
              </div>

              {referrals.length === 0 ? (
                <div className="p-6 text-center rounded-lg bg-secondary/30 border border-dashed border-border">
                  <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No referrals yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((ref: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Firm Name</p>
                          <p className="text-sm font-semibold text-foreground">{ref.firmName || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Designation</p>
                          <p className="text-sm font-semibold text-foreground">{ref.designation || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Email</p>
                          <p className="text-sm text-foreground break-all">{ref.mailId || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Contact</p>
                          <p className="text-sm text-foreground">{ref.contact || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Location</p>
                          <p className="text-sm text-foreground">{ref.location || "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Referral Name</p>
                          <p className="text-sm text-foreground">{ref.referralName || "—"}</p>
                        </div>

                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Business Type</p>
                              <p className="text-sm text-foreground">{ref.natureOfBusiness || "—"}</p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium">Trade Executions</p>
                                  <p className="text-sm font-semibold text-foreground">
                                    {ref.totalTradeExecution || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

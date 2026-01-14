"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface Referral {
  mailId: string;
  contact: string;
  firmName: string;
  location: string;
  entityType: string;
  designation: string;
  referralName: string;
  natureOfBusiness: string;
  totalTradeExecution: string;
};

interface PartnerApplication {
  id: number;
  userId: number;
  requestedRoleId: number;
  currentStep: number;
  completedSteps: number[];
  formData: {
    step1?: {
      email: string;
      fullName: string;
      accountType: string;
      firmName?: string;
      category?: string;
    };
    step2?: {
      city: string;
      name: string;
      state: string;
      mobile: string;
      country: string;
      panCard: string;
      zipCode: string;
      bankName: string;
      ifscCode: string;
      aadharCard: string;
      addressLine1: string;
      addressLine2: string;
      addressState: string;
      accountNumber: string;
    };
    step5?: Referral[];
  };
  documents: {
    cmlCopy?: string;
    panCard?: string;
    signature?: string;
    cancelCheque?: string;
    agreement?: string;
  };
  status: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  approvalToken: string | null;
  createdAt: string;
  updatedAt: string;

  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    emailVerified: boolean;
    superiorId?: number | null;
    superiorName?: string | null;
    superior?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };

  requestedRole: {
    id: number;
    name: string;
  };
}


interface PartnerDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: PartnerApplication | null;
}

export default function PartnerDetails({
  isOpen,
  onClose,
  application,
}: PartnerDetailsDrawerProps) {
  if (!application) return null;

  const getStepStatus = (stepNumber: number) => {
    if (application.completedSteps.includes(stepNumber)) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (application.currentStep === stepNumber) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      draft: "outline",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] max-md:w-[95vw] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Partner Application Details
          </SheetTitle>
          <SheetDescription>
            Complete application information for {application.user.firstName}{" "}
            {application.user.lastName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(application.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Step:</span>
                <Badge variant="outline">
                  Step {application.currentStep}/6
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requested Role:</span>
                <Badge>{application.requestedRole.name}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Registration Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Registration Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    {getStepStatus(step)}
                    <span className="text-sm">
                      Step {step}:{" "}
                      {step === 1
                        ? "Basic Information"
                        : step === 2
                          ? "Personal & Bank Details"
                          : step === 3
                            ? "Document Upload"
                            : step === 4
                              ? "Verification"
                              : step === 5
                                ? "Referrals"
                                : "Agreement & Approval"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          {application.formData.step1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Full Name
                    </span>
                    <p className="text-sm font-medium">
                      {application.formData.step1.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Account Type
                    </span>
                    <p className="text-sm font-medium">
                      {application.formData.step1.accountType}
                    </p>
                  </div>
                  {application.formData.step1.firmName && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Firm Name
                      </span>
                      <p className="text-sm font-medium">
                        {application.formData.step1.firmName}
                      </p>
                    </div>
                  )}
                  {application.formData.step1.category && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Entity Type
                      </span>
                      <p className="text-sm font-medium">
                        {application.formData.step1.category}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{application.user.email}</span>
                  {application.user.emailVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                {application.user.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {application.user.phoneNumber}
                    </span>
                  </div>
                )}

                {/*  ADD THIS SECTION BELOW */}
                {application.user.superior && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Reporting To
                      </span>
                      <p className="text-sm font-medium">
                        {application.user.superior.firstName}{" "}
                        {application.user.superior.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.user.superior.email}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Address & Bank Details */}
          {application.formData.step2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address & Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Address
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>{application.formData.step2.addressLine1}</p>
                    {application.formData.step2.addressLine2 && (
                      <p>{application.formData.step2.addressLine2}</p>
                    )}
                    <p>
                      {application.formData.step2.city},{" "}
                      {application.formData.step2.state}{" "}
                      {application.formData.step2.zipCode}
                    </p>
                    <p>{application.formData.step2.country}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Bank Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Bank Name
                      </span>
                      <p className="font-medium">
                        {application.formData.step2.bankName}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        IFSC Code
                      </span>
                      <p className="font-medium">
                        {application.formData.step2.ifscCode}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">
                        Account Number
                      </span>
                      <p className="font-medium">
                        {application.formData.step2.accountNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Identity Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        PAN Card
                      </span>
                      <p className="font-medium">
                        {application.formData.step2.panCard}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Aadhar Card
                      </span>
                      <p className="font-medium">
                        {application.formData.step2.aadharCard}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {!(!application.documents || Object.keys(application.documents).length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(application.documents).map(([key, url]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {key === "cmlCopy"
                            ? "CML Copy"
                            : key === "panCard"
                              ? "PAN Card"
                              : key === "signature"
                                ? "Signature"
                                : key === "cancelCheque"
                                  ? "Cancelled Cheque"
                                  : key === "agreement"
                                    ? "Agreement"
                                    : key}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refferal */}
          {application.formData.step5 && application.formData.step5.length > 0 && (
            <>
              {application.formData.step5.map((referral, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Referral {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Referral Name</span>
                        <p className="text-sm font-medium">{referral.referralName}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Firm Name</span>
                        <p className="text-sm font-medium">{referral.firmName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Email</span>
                        <p className="text-sm font-medium">{referral.mailId}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Contact</span>
                        <p className="text-sm font-medium">{referral.contact}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Location</span>
                        <p className="text-sm font-medium">{referral.location}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Entity Type</span>
                        <p className="text-sm font-medium">{referral.entityType}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Designation</span>
                        <p className="text-sm font-medium">{referral.designation}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Nature of Business</span>
                        <p className="text-sm font-medium">{referral.natureOfBusiness}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">Total Trade Execution</span>
                      <p className="text-sm font-medium">{referral.totalTradeExecution}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}




          {/* Review Information */}
          {application.reviewedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Reviewed At
                  </span>
                  <p className="text-sm">
                    {new Date(application.reviewedAt).toLocaleString()}
                  </p>
                </div>
                {application.reviewNotes && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Review Notes
                    </span>
                    <p className="text-sm">{application.reviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="text-sm">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Last Updated
                </span>
                <p className="text-sm">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

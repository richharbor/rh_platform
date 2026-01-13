"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Building2, CreditCard } from "lucide-react"

interface ProfileData {
  formData: {
    step2: {
      name: string
      city: string
      state: string
      country: string
      zipCode: string
      mobile: string
      addressLine1: string
      addressLine2: string
      addressState: string
      bankName: string
      accountNumber: string
      ifscCode: string
      panCard: string
      aadharCard: string
    }
  }
}

export default function PersonalDetails({ data }: { data: ProfileData }) {
  const step2 = data?.formData.step2

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal & Banking Details</CardTitle>
        <CardDescription>Your address and banking information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Address</span>
          </div>
          <div className="text-sm space-y-1 pl-6">
            <p>{step2?.addressLine1}</p>
            {step2?.addressLine2 && <p>{step2?.addressLine2}</p>}
            <p>
              {step2?.city}, {step2?.addressState} {step2?.zipCode}
            </p>
            <p className="text-muted-foreground">{step2?.country}</p>
          </div>
        </div>

        {/* Banking Information */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Banking Information</span>
          </div>
          <div className="text-sm space-y-2 pl-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank Name:</span>
              <span className="font-medium">{step2?.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-medium">{step2?.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC Code:</span>
              <span className="font-medium">{step2?.ifscCode}</span>
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Identification</span>
          </div>
          <div className="text-sm space-y-2 pl-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PAN Card:</span>
              <span className="font-medium">{step2?.panCard}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aadhar Card:</span>
              <span className="font-medium">{step2?.aadharCard}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

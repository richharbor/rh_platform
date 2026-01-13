"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Phone, Mail, Briefcase } from "lucide-react"

interface Referral {
  mailId: string
  contact: string
  firmName: string
  location: string
  entityType: string
  designation: string
  referralName: string
  natureOfBusiness: string
  totalTradeExecution: string
}

export default function ReferralsList({ referrals }: { referrals: Referral[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div>
            <CardTitle>Referrals</CardTitle>
            <CardDescription>Your network of {referrals?.length} referral(s)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {referrals?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No referrals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals?.map((referral, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 hover:bg-accent/50 transition-colors">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{referral.referralName}</h3>
                    <p className="text-sm text-muted-foreground">{referral.firmName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {referral.entityType}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {referral.designation}
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm truncate">{referral.mailId}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm">{referral.contact}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{referral.location}</p>
                    </div>
                  </div>

                  {/* Nature of Business */}
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business Nature</p>
                      <p className="text-sm">{referral.natureOfBusiness}</p>
                    </div>
                  </div>
                </div>

                {/* Trade Execution */}
                <div className="bg-muted/50 rounded p-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Trade Execution</span>
                  <span className="font-semibold text-primary">{referral.totalTradeExecution}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Shield } from "lucide-react"

interface ProfileData {
  userId: number
  user: {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    emailVerified: boolean
    tier: number
    createdAt: string
  }
  formData: {
    step1: {
      accountType: string[]
    }
  }
}

export default function ProfileInfo({ data }: { data: ProfileData }) {
  const createdDate = new Date(data?.user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your profile details and account status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Name */}
        <div>
          <h3 className="text-2xl font-bold">
            {data?.user.firstName} {data?.user.lastName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">User ID: {data?.user.email}</p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">{data?.user.email}</p>
            {data?.user.emailVerified && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Phone</span>
          </div>
          <p className="text-sm">{data?.user.phoneNumber}</p>
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Account Type</span>
          <div className="flex flex-wrap gap-2">
            {data?.formData.step1.accountType.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Account Status */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Tier</p>
            <p className="text-lg font-semibold">{data?.user.tier}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-semibold">{createdDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

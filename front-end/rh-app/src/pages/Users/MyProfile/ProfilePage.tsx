"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getMyProfile } from "@/services/Auth/selfServices"
import ProfileInfo from "./ProfileInfo"
import PersonalDetails from "./PersonalDetails"
import ReferralsList from "./ReferralsList"
import { ScrollArea } from "@/components/ui/scroll-area"
import Loading from "@/app/loading"

interface ProfileData {
    id: number
    userId: number
    formData: {
        step1: {
            email: string
            fullName: string
            accountType: string[]
        }
        step2: {
            city: string
            name: string
            state: string
            mobile: string
            country: string
            panCard: string
            zipCode: string
            bankName: string
            ifscCode: string
            aadharCard: string
            addressLine1: string
            addressLine2: string
            addressState: string
            accountNumber: string
        }
        step5: Array<{
            mailId: string
            contact: string
            firmName: string
            location: string
            entityType: string
            designation: string
            referralName: string
            natureOfBusiness: string
            totalTradeExecution: string
        }>
    }
    user: {
        id: number
        email: string
        firstName: string
        lastName: string
        phoneNumber: string
        emailVerified: boolean
        createdAt: string
        franchiseId: number
        tier: number
    }
}

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true)
                // Replace with your actual API endpoint
                const response = await getMyProfile()
                if (!response.success) {
                    throw new Error("Failed to fetch profile data")
                }

                setData(response.data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [])

    if (loading) {
        return (
            <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
                <Loading areaOnly={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>No Data Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Profile data could not be loaded.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (

        <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none relative ">
            <div className="flex-1 min-h-0 border-t">
                <ScrollArea className="h-full w-full">
                    <main className="min-h-screen bg-background p-4 md:p-8">
                        <div className="mx-auto max-w-6xl space-y-6">
                            {/* Header */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">User Profile</h1>
                                <p className="text-muted-foreground">Manage your account information and referrals</p>
                            </div>

                            {/* Profile Grid */}
                            <div className={data.formData.step2 ? "grid gap-6 md:grid-cols-2" : ""}>
                                {/* Profile Info Card */}
                                <ProfileInfo data={data} />

                                {/* Personal Details Card */}
                                {data.formData.step2 && <PersonalDetails data={data} />}
                            </div>

                            {/* Referrals Section */}
                            {data.formData.step5 && <ReferralsList referrals={data.formData.step5} />}
                        </div>
                    </main>
                </ScrollArea>
            </div>
        </div>

    )
}

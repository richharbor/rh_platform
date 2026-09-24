import { Button } from "@/components/ui/button"
import { CircleCheckBig, CircleX } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { convertToHtmlForm } from "@/helpers/emailHelper"
import { sendEmail } from "@/services/emailServices"
import { postLead, LeadData } from "@/services/leadService"

const loans = [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
    { id: 'city', label: 'City', type: 'text', required: true },
    {
        id: 'loanType',
        label: 'Loan Type',
        type: 'select',
        options: ['Home', 'Personal', 'Business', 'Mortgage', 'Education', 'Car', 'Machinery', 'WC', 'Construction', 'Project Finance', 'RBF', 'FTL', 'Channel Financing'],
        required: true
    },
    { id: 'amount', label: 'Loan Amount Required (₹)', type: 'number', required: true, conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Business', 'Mortgage', 'Education', 'Car', 'Machinery', 'WC', 'FTL', 'Channel Financing'] } },
    { id: 'purpose', label: 'Purpose of Loan', type: 'text', required: true, conditional: { fieldId: 'loanType', value: ['Personal', 'Business', 'Machinery', 'Mortgage'] } },
    { id: 'timeline', label: 'Expected Disbursal Timeline', type: 'text', required: true, conditional: { fieldId: 'loanType', value: ['Business', 'Machinery', 'Mortgage'] } },
    { id: 'creditProfile', label: 'Credit Profile', type: 'select', options: ['Excellent', 'Average', 'Needs Assessment'], required: true },

    // Retail Loans
    { id: 'employmentType', label: 'Employment Type', type: 'select', options: ['Salaried', 'Business'], conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Car'] } },
    { id: 'monthlyIncome', label: 'Monthly Income (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Car'] } },
    { id: 'employer', label: 'Employer / Business Name', type: 'text', conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Car'] } },
    { id: 'cibil', label: 'Approx CIBIL Score', type: 'text', conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Car', 'Education'] } },
    { id: 'emis', label: 'Existing Loans (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Car', 'Education'] } },

    // Additional Field in Home loan
    { id: 'propertyType', label: 'Property Type', type: 'select', options: ['Construction', 'Ready', 'Plot'], conditional: { fieldId: 'loanType', value: ['Home'] } },
    { id: 'propertyCity', label: 'City of Property', type: 'text', conditional: { fieldId: 'loanType', value: ['Home'] } },

    // Additional Field in Education
    { id: 'educationType', label: 'Course Type', type: 'select', options: ['Undergraduate', 'Postgraduate', 'PhD'], conditional: { fieldId: 'loanType', value: ['Education'] } },
    { id: 'countryOfStudy', label: 'Country of Study', type: 'text', conditional: { fieldId: 'loanType', value: ['Education'] } },
    { id: 'collageName', label: 'Collage Name', type: 'text', conditional: { fieldId: 'loanType', value: ['Education'] } },

    // Additional Field in Car loan
    { id: 'assetType', label: 'Asset Type', type: 'select', options: ['New', 'Used'], conditional: { fieldId: 'loanType', value: ['Car'] } },
    { id: 'carMktValue', label: 'Car Mkt value (₹)', type: 'text', conditional: { fieldId: 'loanType', value: ['Car'] } },

    // Additional Field in WC loan
    { id: 'businessType', label: 'Business Type', type: 'text', conditional: { fieldId: 'loanType', value: ['WC'] } },
    { id: 'currentBankingRelationship', label: 'Current Banking Relationship', type: 'radio', options: ['OD', 'CC', 'Invoice discounting'], conditional: { fieldId: 'loanType', value: ['WC'] } },

    // Additional Field in Construction
    { id: 'fundingRequired', label: 'Funding Required', type: 'text', required: true, conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance', 'RBF'] } },
    { id: 'projectType', label: 'Project Type', type: 'text', conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance'] } },
    { id: 'totalProjectCost', label: 'Total Project Cost (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance'] } },
    { id: 'landOwnerStatus', label: 'Land Owner Status ', type: 'text', conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance'] } },
    { id: 'stateOfProject', label: 'State of Project', type: 'text', conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance'] } },

    // Additional field in RBF
    { id: 'businessModal', label: 'Business Modal', type: 'text', conditional: { fieldId: 'loanType', value: ['RBF'] } },
    { id: 'revenueSource', label: 'Revenue Source', type: 'text', conditional: { fieldId: 'loanType', value: ['RBF'] } },
    { id: 'repaymentPreference', label: 'Repayment Preference', type: 'text', conditional: { fieldId: 'loanType', value: ['RBF'] } },

    // Additional field in FTL
    { id: 'loanTenureRequired', label: 'Loan Tenure Required', type: 'text', conditional: { fieldId: 'loanType', value: ['FTL'] } },
    { id: 'businessVintage', label: 'Business Vintage', type: 'text', conditional: { fieldId: 'loanType', value: ['FTL'] } },

    // Business Loans
    { id: 'businessName', label: 'Business Name', type: 'text', conditional: { fieldId: 'loanType', value: ['Business', 'WC', 'Machinery'] } },
    { id: 'vintage', label: 'Business Vintage (Years)', type: 'number', conditional: { fieldId: 'loanType', value: ['Business', 'WC', 'Machinery'] } },
    { id: 'turnover', label: 'Annual Turnover (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Business', 'WC', 'Machinery'] } },
    { id: 'netProfit', label: 'Net Profit (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Business', 'WC', 'Machinery'] } },
    { id: 'gst', label: 'GST Registered', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'loanType', value: ['Business', 'WC', 'Machinery'] } },
    { id: 'gstTurnover', label: 'Last 12-month GST Turnover (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Machinery'] } },
    { id: 'collateral', label: 'Collateral Available', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'loanType', value: ['Business', 'Machinery'] } },

    // Mortgage
    { id: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential', 'Commercial'], conditional: { fieldId: 'loanType', value: ['Mortgage', 'Construction'] } },
    { id: 'location', label: 'Property Location', type: 'text', conditional: { fieldId: 'loanType', value: ['Mortgage', 'Construction'] } },
    { id: 'propertyValue', label: 'Approx Property Value (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Mortgage', 'Construction'] } },
    { id: 'ownership', label: 'Ownership Status', type: 'text', conditional: { fieldId: 'loanType', value: ['Mortgage', 'Construction'] } },
    { id: 'existingLoan', label: 'Existing Loan on Property', type: 'text', conditional: { fieldId: 'loanType', value: ['Mortgage', 'Construction'] } },

    // Corporate / Project
    { id: 'natureBusiness', label: 'Nature of Business', type: 'text', conditional: { fieldId: 'loanType', value: ['Project Finance', 'RBF', 'FTL', 'Channel Financing'] } },
    { id: 'avgRevenue', label: 'Average Monthly Revenue (₹)', type: 'number', conditional: { fieldId: 'loanType', value: ['Project Finance', 'RBF', 'FTL', 'Channel Financing'] } },
    { id: 'anchor', label: 'Anchor / OEM / Buyer Name', type: 'text', conditional: { fieldId: 'loanType', value: ['Project Finance', 'Channel Financing'] } },
    { id: 'relationshipWithAnchor', label: 'Relationship with Anchor ', type: 'text', conditional: { fieldId: 'loanType', value: ['Channel Financing'] } },
    { id: 'bankingRel', label: 'Existing Banking Relationship', type: 'text', conditional: { fieldId: 'loanType', value: ['Project Finance', 'RBF', 'FTL', 'Channel Financing'] } },
    { id: 'security', label: 'Security Offered', type: 'text', conditional: { fieldId: 'loanType', value: ['Project Finance', 'FTL', 'Channel Financing'] } }
];

interface LoanFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoanFormDialog({ open, onOpenChange }: LoanFormDialogProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [succOpen, setSuccOpen] = useState(false);
    const [errOpen, setErrOpen] = useState(false);

    const [error, setError] = useState("");

    const handleInputChange = (id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (error) setError("");
    };

    const isFieldVisible = (field: any) => {
        if (!field.conditional) return true;
        const dependentValue = formData[field.conditional.fieldId];
        return field.conditional.value.includes(dependentValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic validation for visible required fields
        for (const field of loans) {
            if (isFieldVisible(field) && field.required && !formData[field.id]) {
                setError(`Please fill ${field.label}`);
                setLoading(false);
                return;
            }
        }

        const { name, email, phone, city, ...rest } = formData;

        const leadData: LeadData = {
            product_type: 'loan',
            lead_type: 'self',
            name: name,
            email: email,
            phone: phone,
            city: city,
            product_details: {
                ...rest,
                source: 'web'
            }
        };

        try {
            const response = await postLead(leadData);
            const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query%20about%20loans.`;
            window.open(whatsappUrl, "_blank");
            if (response) {
                setSuccOpen(true);
                setFormData({});
                onOpenChange(false);
            } else {
                setErrOpen(true);
            }
        } catch (error) {
            console.error("Lead submission error:", error);
            setErrOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Apply for a Loan</DialogTitle>
                        <DialogDescription>
                            Please fill in the details below. We will get back to you shortly.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {loans.map((field) => {
                            if (!isFieldVisible(field)) return null;

                            return (
                                <div key={field.id} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                                    <Label htmlFor={field.id}>
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === 'select' ? (
                                        <Select
                                            onValueChange={(value) => handleInputChange(field.id, value)}
                                            value={formData[field.id] || ''}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt: string) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === 'radio' ? (
                                        <div className="flex gap-4 pt-2">
                                            {field.options?.map((opt: string) => (
                                                <div key={opt} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id={`${field.id}-${opt}`}
                                                        name={field.id}
                                                        value={opt}
                                                        checked={formData[field.id] === opt}
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        className="accent-primary h-4 w-4"
                                                    />
                                                    <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Input
                                            id={field.id}
                                            type={field.type}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            required={field.required}
                                            placeholder={`Enter ${field.label}`}
                                            className="bg-secondary/10"
                                        />
                                    )}
                                </div>
                            );
                        })}

                        <div className="md:col-span-2 pt-4">
                            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={succOpen} onOpenChange={setSuccOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success 🎉</DialogTitle>
                        <DialogDescription>
                            Your loan application has been submitted successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-green-500 w-full ">
                        <CircleCheckBig className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={errOpen} onOpenChange={setErrOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>Unable to submit application. Please try again.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-red-500 w-full ">
                        <CircleX className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

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

const insurance = [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'insuranceType', label: 'Insurance Type', type: 'select', options: ['Life', 'Health', 'Motor'], required: true },
    { id: 'budget', label: 'Annual Premium Budget (₹)', type: 'number', required: true },
    { id: 'coverage', label: 'Coverage Required (₹)', type: 'number', required: true },
    { id: 'existingPolicy', label: 'Existing Policy', type: 'radio', options: ['Yes', 'No'], required: true },
    // { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], required: true },


    // Life
    { id: 'productType', label: 'Product Type', type: 'radio', options: ['Term', 'Saving', 'Investment'], conditional: { fieldId: 'insuranceType', value: 'Life' } },
    { id: 'age', label: 'Age', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
    { id: 'income', label: 'Annual Income', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
    { id: 'occupation', label: 'Occupation', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Life' } },
    //{ id: 'coverage', label: 'Coverage Required (₹)', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
    { id: 'smoker', label: 'Smoker', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Life' } },
    { id: 'alcoholic', label: 'Alcoholic', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Life' } },

    // Health
    { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'policyType', label: 'Policy Type', type: 'radio', options: ['Individual', 'Family Floater'], conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'memberAges', label: 'Age of Insured Members', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'membersCovered', label: 'Family Members to be Covered', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'conditions', label: 'Existing Medical Conditions', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'sumInsured', label: 'Sum Insured Required (₹)', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'smoker', label: 'Smoker', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Health' } },
    { id: 'alcoholic', label: 'Alcoholic', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Health' } },

    // Motor
    { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], conditional: { fieldId: 'insuranceType', value: 'Motor' } },
    { id: 'policyType', label: 'Policy Type', type: 'radio', options: ['Third Party', 'Comprehensive'], conditional: { fieldId: 'insuranceType', value: 'Motor' } },
    { id: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Car', 'Two-Wheeler', 'Commercial'], conditional: { fieldId: 'insuranceType', value: 'Motor' } },
    { id: 'vehicleModel', label: 'Vehicle Model & Year', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Motor' } },
    { id: 'expiryDate', label: 'Policy Expiry Date', type: 'date', conditional: { fieldId: 'insuranceType', value: 'Motor' } },
    { id: 'claimHistory', label: 'Claim History', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Motor' } }
]

interface InsuranceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InsuranceFormDialog({ open, onOpenChange }: InsuranceFormDialogProps) {
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
        // If conditional value requires specific match
        if (Array.isArray(field.conditional.value)) {
            return field.conditional.value.includes(dependentValue);
        }
        return field.conditional.value === dependentValue;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic validation for visible required fields
        for (const field of insurance) {
            if (isFieldVisible(field) && field.required && !formData[field.id]) {
                setError(`Please fill ${field.label}`);
                setLoading(false);
                return;
            }
        }

        const { name, email, phone, city, ...rest } = formData;

        const leadData: LeadData = {
            product_type: 'insurance',
            lead_type: 'self',
            name: name,
            email: email,
            phone: phone, // Assuming phone can be string, leadService defines it as string
            city: city,
            product_details: {
                ...rest,
                source: 'web'
            }
        };

        try {
            const response = await postLead(leadData);
            const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query%20about%20insurance.`;
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
                        <DialogTitle>Request an Insurance Quote</DialogTitle>
                        <DialogDescription>
                            Please fill in the details below. We will get back to you with the best options.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {insurance.map((field) => {
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
                                        <div className="flex gap-4 pt-2 flex-wrap">
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
                                {loading ? 'Submitting...' : 'Submit Request'}
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
                            Your insurance enquiry has been submitted successfully.
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
                        <DialogDescription>Unable to submit enquiry. Please try again.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-red-500 w-full ">
                        <CircleX className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

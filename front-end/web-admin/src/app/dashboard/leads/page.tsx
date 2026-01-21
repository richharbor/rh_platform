"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getLeads, assignLead, updateLeadInternalStatus, createLead, updateLead, updateWebLeadStatus } from '@/services/Leads/leadService';
import { getRMs } from '@/services/Users/userService';
import SidePanel from '@/components/ui/SidePanel';
// import Modal from '@/components/ui/Modal';

import { settingsService } from '@/services/Settings/settingsService';
import { ScrollArea } from '@/components/ui/scroll-area';


export type FieldType = 'text' | 'number' | 'email' | 'phone' | 'select' | 'radio' | 'date' | 'checkbox' | 'multiselect';

export interface LeadField {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: string[];
    required?: boolean;
    conditional?: {
        fieldId: string;
        value: string | string[];
    };
}

export const PRODUCT_FORMS: Record<string, LeadField[]> = {
    insurance: [
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
    ],

    loans: [
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
    ],

    equity: [
        { id: 'companyName', label: 'Company Name', type: 'text', required: true },
        { id: 'industry', label: 'Industry / Sector', type: 'text', required: true },
        { id: 'stage', label: 'Stage', type: 'select', options: ['Growth', 'Late Stage', 'Pre-IPO'], required: true },
        { id: 'capital', label: 'Capital Required (₹)', type: 'number', required: true },
        { id: 'useOfFunds', label: 'Use of Funds', type: 'text', required: true },
        { id: 'revenue', label: 'Revenue (Last FY & TTM)', type: 'text', required: true },
        { id: 'ebitda', label: 'EBITDA Margin (%)', type: 'number', required: true },
        { id: 'investors', label: 'Existing Investors', type: 'text', required: false },
        { id: 'promoter', label: 'Promoter/ Key Contact name ', type: 'text', required: false },
        { id: 'promoterContact', label: 'Promoter/ Key Contact', type: 'number', required: false },
        { id: 'nda', label: 'Willing to share financials under NDA', type: 'radio', options: ['Yes', 'No'], required: true },
        { id: 'auditedFinancials', label: 'Audited Financials Available ', type: 'radio', options: ['Yes', 'No'], required: true }

    ],

    unlisted: [
        { id: 'clientType', label: 'Client Type', type: 'select', options: ['Retail', 'HNI', 'Family Office'], required: true },
        { id: 'buySell', label: 'Action', type: 'radio', options: ['Buy', 'Sell'], required: true },
        { id: 'companyName', label: 'Company Name (Unlisted)', type: 'text', required: true },
        { id: 'ticketSize', label: 'Quantity / Ticket Size (₹)', type: 'number', required: true },
        { id: 'horizon', label: 'Investment Horizon', type: 'text', required: true },
        { id: 'prevExp', label: 'Previous Unlisted Investment Experience', type: 'radio', options: ['Yes', 'No'], required: true },
        { id: 'demat', label: 'Demat Account Available', type: 'radio', options: ['Yes', 'No'], required: true }
    ],

    stocks: [
        { id: 'category', label: 'Client Category', type: 'select', options: ['HNI', 'Institution', 'Trader'], required: true },
        { id: 'buySell', label: 'Action', type: 'radio', options: ['Buy', 'Sell'], required: true },
        { id: 'stockName', label: 'Stock Name', type: 'text', required: true },
        { id: 'quantity', label: 'Approx Quantity / Value', type: 'text', required: true },
        { id: 'timeSensitivity', label: 'Time Sensitivity', type: 'radio', options: ['Immediate', 'Flexible'], required: true },
        { id: 'settlement', label: 'Settlement Preference', type: 'select', options: ['On-market', 'Off-market'], required: true }
    ]
};


export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ product: '', status: '', search: '' });
    const [activeSourceTab, setActiveSourceTab] = useState<'web' | 'app'>('app'); // Default to App leads

    // Side Panel & Action States
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isWebPanelOpen, setIsWebPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');
    const [rms, setRms] = useState<any[]>([]);

    // Edit States
    const [newStatus, setNewStatus] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [notifyUser, setNotifyUser] = useState(true); // Default true
    const [actionLoading, setActionLoading] = useState(false);

    // Reward Confirmation State
    // Reward Confirmation State
    const [isRewardConfirmOpen, setIsRewardConfirmOpen] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [calculationDetails, setCalculationDetails] = useState<any>(null); // Store breakdown
    const [productRules, setProductRules] = useState<any[]>([]);

    // Create/Edit Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditRequirements, setIsEditRequirements] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '', email: '', phone: '', city: '',
        product_type: 'unlisted', // Default strictly to a valid key in PRODUCT_FORMS
        requirement: '',
        product_details: {}
    });

    useEffect(() => {
        loadData();
        loadRules();
    }, [filters, activeSourceTab]);

    const loadRules = async () => {
        try {
            const rules = await settingsService.getProductRules();
            setProductRules(rules);
        } catch (e) { console.error("Error loading rules", e); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [leadsData, rmsData] = await Promise.all([getLeads(), getRMs()]);
            setRms(rmsData);

            let filtered = leadsData;

            // Filter by Source (Web vs App)
            if (activeSourceTab === 'web') {
                filtered = filtered.filter((l: any) => l.product_details?.source === 'web');
            } else {
                // App leads: source is missing or explicitly 'app' (or anything not 'web')
                filtered = filtered.filter((l: any) => !l.product_details?.source || l.product_details?.source !== 'web');
            }

            if (filters.status) filtered = filtered.filter((l: any) => l.internal_status === filters.status);
            if (filters.product) filtered = filtered.filter((l: any) => l.product_type === filters.product);
            if (filters.search) {
                const q = filters.search.toLowerCase();
                filtered = filtered.filter((l: any) =>
                    l.name.toLowerCase().includes(q) ||
                    l.email?.toLowerCase().includes(q) ||
                    l.phone?.includes(q)
                );
            }

            setLeads(filtered);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const openLead = (lead: any) => {
        setSelectedLead(lead);
        setNewStatus(lead.status || 'New');
        setAssigneeId(lead.assignee_id || '');
        setActiveTab('summary');

        if (lead.product_details?.source === 'web') {
            setIsWebPanelOpen(true);
        } else {
            setIsPanelOpen(true);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedLead) return;

        // Check if moving to Disbursed/Closed - Show Confirmation
        if ((newStatus === 'Disbursed' || newStatus === 'Closed') && selectedLead.status !== newStatus) {
            // Calculate Estimated Reward
            const leadType = selectedLead.product_type;
            const rule = productRules.find(r => r.product_type === leadType || r.product_type.toLowerCase() === leadType.toLowerCase());
            // Determine percentage based on user's role
            // Determine percentage based on user's role
            let percentage = 0;
            const rawRole = selectedLead.user?.role || 'partner';
            const role = rawRole.toLowerCase();

            if (rule) {
                if (role === 'customer') {
                    percentage = rule.customer_percentage || 0;
                } else if (role === 'referral partner' || role === 'referral_partner') {
                    percentage = rule.referral_partner_percentage || 0;
                } else {
                    // Default to Partner (role === 'partner' or other)
                    percentage = rule.partner_percentage || 0;
                }
                console.log(`Calculating incentive for ${role}: ${percentage}%`);
            }

            const details = selectedLead.product_details || {};
            // Extract value based on known fields or generic amount
            const val = details.amount || details.capital || details.ticketSize || details.budget || details.coverage || details.sumInsured || details.price || 0;
            const leadValue = parseFloat(val) || 0;
            // Also consider quantity if price exists (e.g. Unlisted)
            const finalValue = (details.price && details.quantity) ? (parseFloat(details.price) * parseFloat(details.quantity)) : leadValue;

            const estAmount = finalValue * (percentage / 100);

            // Store details for display
            setCalculationDetails({
                role: rawRole, // Display the raw role name (e.g. "Partner" or "partner")
                percentage: percentage,
                leadValue: finalValue,
                productType: leadType
            });

            setRewardAmount(estAmount);
            setIsRewardConfirmOpen(true);
            return;
        }

        // otherwise regular update
        await finalizeStatusUpdate();
    };
    const handleWebLeadStatusUpdate = async () => {
        if (!selectedLead) return;

        await finalizeWebLeadStatusUpdate();
    }

    const finalizeStatusUpdate = async () => {
        setActionLoading(true);
        try {
            const payload = {
                status: newStatus,
                incentive_amount: rewardAmount, // Will be 0 if not set via modal, which logic ignores or uses as 0 override?
                // Actually backend logic: if undefined/null -> calc. If provide -> use. 
                // We should pass it ONLY if we confirmed it. But if we skip confirmation, we pass 0?
                // Better: pass it only if isRewardConfirmOpen was true. 
                // But simplified: pass it always? No, strict check backend checks for undefined.
                notifyUser: notifyUser
            };

            // If we are confirming reward, pass it.
            if (isRewardConfirmOpen) {
                // @ts-ignore
                payload.incentive_amount = rewardAmount;
            }

            const updated = await updateLeadInternalStatus(selectedLead.id, payload);

            setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setSelectedLead({ ...selectedLead, ...updated });

            toast.success('Status updated successfully');
            setIsRewardConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };
    const finalizeWebLeadStatusUpdate = async () => {
        setActionLoading(true);
        try {
            const payload = {
                status: newStatus,
            };


            const updated = await updateWebLeadStatus(selectedLead.id, payload);

            setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setSelectedLead({ ...selectedLead, ...updated });

            toast.success('Status updated successfully');
            setIsRewardConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedLead || !assigneeId) return;
        setActionLoading(true);
        try {
            const updated = await assignLead({ leadId: selectedLead.id, rmId: assigneeId });

            // We need to re-fetch or manual merge because assignLead returns the lead but might not populate 'assigned_rm' relation immediately if backend just returns row
            // Ideally we re-fetch, but for speed let's manually find the name
            const rm = rms.find(r => r.id === assigneeId);
            const enrichedC = { ...updated, assigned_admin: rm }; // Mock relation update

            setLeads(prev => prev.map(l => l.id === updated.id ? enrichedC : l));
            setSelectedLead({ ...selectedLead, ...updated, assigned_admin: rm });

            toast.success('RM Assigned successfully');
        } catch (error) {
            toast.error('Failed to assign RM');
        } finally {
            setActionLoading(false);
        }
    };


    const handleSubmit = async () => {

        setActionLoading(true);



        const { name, email, phone, city, ...rest } = formData;

        const leadData: any = {
            product_type: formData.product_type, // Or specific mapping if needed 'loan' vs 'loans'
            lead_type: 'client',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            product_details: {
                ...formData.product_details,
                source: 'web'
            }
        };

        try {
            const response = await createLead(leadData);
            toast.success("Lead created successfully")
            setFormData({});
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Lead submission error:", error);
            toast.error("Failed to create lead")
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            {/* Header & Filters (Keep same structure) */}
            {/* Header & Filters */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lead Management</h1>
                <div className="flex gap-2">
                    <button className="btn bg-gray-200 text-gray-800" onClick={() => loadData()}>Refresh</button>
                    <button className="btn btn-primary" onClick={() => {
                        setFormData({ name: '', email: '', phone: '', city: '', product_type: 'unlisted', requirement: '', product_details: {} });
                        setIsCreateOpen(true);
                    }}>+ Create Lead</button>
                </div>
            </div>

            <div className="card mb-6">
                {/* Source Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`px-6 py-2 font-medium text-sm focus:outline-none ${activeSourceTab === 'app' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveSourceTab('app')}
                    >
                        App Leads
                    </button>
                    <button
                        className={`px-6 py-2 font-medium text-sm focus:outline-none ${activeSourceTab === 'web' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveSourceTab('web')}
                    >
                        Direct Leads
                    </button>
                </div>

                <div className="flex gap-4">
                    <input className="input" placeholder="Search Client..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                    <select className="input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Credit Approved">Credit Approved</option>
                        <option value="Disbursed">Disbursed</option>
                        <option value="Closed">Closed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Lead ID</th><th>Client Name</th><th>Product</th><th>Status</th><th>Assigned RM</th><th>Created</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr> :
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openLead(lead)}>
                                    <td>{lead.id}</td>
                                    <td>{lead.name}</td>
                                    <td>{lead.product_type}</td>
                                    <td><span className={`status-badge`}>{lead.status}</span></td>
                                    <td>{lead.assigned_admin ? lead.assigned_admin.name : 'Unassigned'}</td>
                                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                    <td><button className="text-blue-600 hover:underline">View</button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Right Side Panel */}
            <SidePanel isOpen={isPanelOpen} onClose={() => { setIsPanelOpen(false); setIsRewardConfirmOpen(false); }} title={`Lead #${selectedLead?.id} - ${selectedLead?.name}`}>
                {selectedLead && (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {['summary', 'assignment', 'status'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 capitalize ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>

                        {activeTab === 'summary' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded">
                                    <h4 className="font-bold text-gray-700 mb-2">Contact Details</h4>
                                    <p>Email: {selectedLead.email}</p>
                                    <p>Phone: {selectedLead.phone}</p>
                                    <p>City: {selectedLead.city}</p>
                                    <p>Lead Type: {selectedLead.lead_type}</p>

                                </div>

                                {/* Requirement & Product Details (Editable) */}
                                <div className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-gray-700">Requirement Details</h4>
                                        {/* {!isEditRequirements ? (
                                            <button className="text-blue-600 text-sm hover:underline" onClick={() => {
                                                setFormData({
                                                    ...selectedLead,
                                                    product_details: selectedLead.product_details || {},
                                                    requirement: selectedLead.requirement || ''
                                                });
                                                setIsEditRequirements(true);
                                            }}>Edit</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button className="text-gray-500 text-xs" onClick={() => setIsEditRequirements(false)}>Cancel</button>
                                                <button className="text-green-600 text-xs font-bold" onClick={async () => {
                                                    const res = await updateLead(selectedLead.id, {
                                                        product_details: formData.product_details,
                                                        requirement: formData.requirement
                                                    });
                                                    setLeads(prev => prev.map(l => l.id === res.id ? { ...l, ...res } : l));
                                                    setSelectedLead({ ...selectedLead, ...res });
                                                    setIsEditRequirements(false);
                                                    toast.success('Updated');
                                                }}>Save</button>
                                            </div>
                                        )} */}
                                    </div>

                                    {!isEditRequirements ? (
                                        <>
                                            <div className="mb-2">
                                                <p className="text-sm font-semibold text-gray-500">Requirement</p>
                                                <p className="text-sm">{selectedLead.requirement || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">Specs</p>
                                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono">
                                                    {Object.entries(selectedLead.product_details || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                                                </pre>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="animation-fade-in space-y-3">
                                            {selectedLead.product_type === 'Unlisted Shares' && (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Scrip Name</label>
                                                        <input className="input h-8 text-sm"
                                                            value={formData.product_details.scripName || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, scripName: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Qty</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.quantity || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, quantity: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Price</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.price || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, price: e.target.value } })}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {selectedLead.product_type === 'Insurance' && (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Type</label>
                                                        <select className="input h-8 text-sm py-0"
                                                            value={formData.product_details.type || 'Health'}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, type: e.target.value } })}
                                                        >
                                                            <option value="Health">Health</option>
                                                            <option value="Life">Life</option>
                                                            <option value="Motor">Motor</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Coverage</label>
                                                        <input className="input h-8 text-sm"
                                                            value={formData.product_details.coverage || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, coverage: e.target.value } })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">General Requirement</label>
                                                <textarea className="input text-sm p-2 h-20"
                                                    value={formData.requirement || ''}
                                                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'assignment' && (
                            <div className="space-y-4">
                                <p>Current RM: <b>{selectedLead.assigned_admin ? selectedLead.assigned_admin.name : 'None'}</b></p>
                                <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                                    <option value="">Select RM</option>
                                    {rms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <button className="btn btn-primary w-full" onClick={handleAssign} disabled={actionLoading}>
                                    {actionLoading ? 'Assigning...' : 'Update Assignment'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'status' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-bold">Internal Status</label>
                                <select
                                    className="input"
                                    value={newStatus}
                                    onChange={e => {
                                        setNewStatus(e.target.value);
                                        setIsRewardConfirmOpen(false); // Reset on change
                                    }}
                                    disabled={isRewardConfirmOpen || selectedLead.status === 'Closed'}
                                >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Credit Approved">Credit Approved</option>
                                    <option value="Disbursed">Disbursed</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                {newStatus === 'Rejected' && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
                                        Note: Lead will be marked as rejected.
                                    </div>
                                )}

                                {(newStatus === 'Closed' || newStatus === 'Disbursed') && (
                                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
                                        Note: If you change the status to {newStatus}, it creates a payout you can see in the payout page. {newStatus === 'Closed' ? 'Once the lead is Closed, you cannot change it again.' : ''}
                                    </div>
                                )}

                                {/* Inline Confirmation for Disbursed/Closed */}
                                {isRewardConfirmOpen ? (
                                    <div className="bg-blue-50 p-4 rounded-lg animation-fade-in border border-blue-100">
                                        <h4 className="font-bold text-blue-900 mb-2 text-sm">Confirm Incentive Payout</h4>
                                        <p className="text-xs text-blue-700 mb-3">
                                            Status change to <b>{newStatus}</b> will trigger a payout.
                                        </p>

                                        {/* Calculation Breakdown */}
                                        {calculationDetails && (
                                            <div className="bg-white/50 p-3 rounded mb-3 text-xs border border-blue-100">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">User Role:</span>
                                                    <span className="font-bold">{calculationDetails.role}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Lead Value:</span>
                                                    <span>₹{calculationDetails.leadValue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Rate ({calculationDetails.productType}):</span>
                                                    <span>{calculationDetails.percentage}%</span>
                                                </div>
                                                <div className="border-t border-blue-200 my-1 pt-1 flex justify-between font-bold text-blue-900">
                                                    <span>Calculated:</span>
                                                    <span>₹{(calculationDetails.leadValue * (calculationDetails.percentage / 100)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        <label className="text-xs font-bold text-gray-500 uppercase">Incentive Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="input text-lg font-bold text-gray-900 w-full mb-4"
                                            value={rewardAmount || ''}
                                            placeholder="0"
                                            onChange={(e) => setRewardAmount(Number(e.target.value))}
                                        />

                                        <button
                                            className="btn btn-primary w-full mb-2 bg-green-600 hover:bg-green-700"
                                            onClick={finalizeStatusUpdate}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Processing...' : `Confirm & Update Status`}
                                        </button>
                                        <button
                                            className="btn w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            onClick={() => setIsRewardConfirmOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {selectedLead.status === 'Closed' && (
                                            <div className="bg-red-50 p-2 rounded text-xs text-red-800 mb-4 border border-red-100">
                                                Locked: This lead is Closed and status cannot be changed.
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-4">
                                            <input
                                                type="checkbox"
                                                id="notifyUser"
                                                className="w-4 h-4 text-blue-600 rounded"
                                                checked={notifyUser}
                                                onChange={e => setNotifyUser(e.target.checked)}
                                                disabled={selectedLead.status === 'Closed'}
                                            />
                                            <label htmlFor="notifyUser" className="text-sm font-medium text-slate-700">Notify User via App 🔔</label>
                                        </div>

                                        <button
                                            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleStatusUpdate}
                                            disabled={actionLoading || selectedLead.status === 'Closed'}
                                        >
                                            {actionLoading ? 'Updating...' : 'Update Status'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>
            {/* Separate WEB Lead Side Panel */}
            <SidePanel isOpen={isWebPanelOpen} onClose={() => { setIsWebPanelOpen(false); setIsRewardConfirmOpen(false); }} title={`WEB Query #${selectedLead?.id} - ${selectedLead?.name}`}>
                {selectedLead && (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {['summary', 'assignment', 'status'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 capitalize ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>

                        {activeTab === 'summary' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded">
                                    <h4 className="font-bold text-gray-700 mb-2">Contact Details</h4>
                                    <p>Email: {selectedLead.email}</p>
                                    <p>Phone: {selectedLead.phone}</p>
                                    <p>City: {selectedLead.city}</p>
                                    <p>Lead Type: {selectedLead.lead_type}</p>
                                </div>

                                {/* Requirement & Product Details (Editable) */}
                                <div className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-gray-700">Requirement Details</h4>
                                        {/* {!isEditRequirements ? (
                                            <button className="text-blue-600 text-sm hover:underline" onClick={() => {
                                                setFormData({
                                                    ...selectedLead,
                                                    product_details: selectedLead.product_details || {},
                                                    requirement: selectedLead.requirement || ''
                                                });
                                                setIsEditRequirements(true);
                                            }}>Edit</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button className="text-gray-500 text-xs" onClick={() => setIsEditRequirements(false)}>Cancel</button>
                                                <button className="text-green-600 text-xs font-bold" onClick={async () => {
                                                    const res = await updateLead(selectedLead.id, {
                                                        product_details: formData.product_details,
                                                        requirement: formData.requirement
                                                    });
                                                    setLeads(prev => prev.map(l => l.id === res.id ? { ...l, ...res } : l));
                                                    setSelectedLead({ ...selectedLead, ...res });
                                                    setIsEditRequirements(false);
                                                    toast.success('Updated');
                                                }}>Save</button>
                                            </div>
                                        )} */}
                                    </div>

                                    {!isEditRequirements ? (
                                        <>
                                            <div className="mb-2">
                                                <p className="text-sm font-semibold text-gray-500">Requirement</p>
                                                <p className="text-sm">{selectedLead.requirement || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">Specs</p>
                                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono">
                                                    {Object.entries(selectedLead.product_details || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                                                </pre>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="animation-fade-in space-y-3">
                                            {/* Reuse same form fields as main panel logic if needed, or keeping it generic for now as Web leads might differ. 
                                                Actually, preserving the dynamic Logic from the first panel would require copying that whole block.
                                                For now, I'll use the generic requirement Textarea editing which is safe for all. 
                                                If users want the specific product fields (Scrip, Insurance Type), I should copy that too. 
                                                The user said "look same". I will assume full copy is safer. */}
                                            {selectedLead.product_type === 'Unlisted Shares' && (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Scrip Name</label>
                                                        <input className="input h-8 text-sm"
                                                            value={formData.product_details.scripName || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, scripName: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Qty</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.quantity || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, quantity: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Price</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.price || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, price: e.target.value } })}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {/* Simplified for other types or generic fallback */}
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">General Requirement</label>
                                                <textarea className="input text-sm p-2 h-20"
                                                    value={formData.requirement || ''}
                                                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'assignment' && (
                            <div className="space-y-4">
                                <p>Current RM: <b>{selectedLead.assigned_admin ? selectedLead.assigned_admin.name : 'None'}</b></p>
                                <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                                    <option value="">Select RM</option>
                                    {rms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <button className="btn btn-primary w-full" onClick={handleAssign} disabled={actionLoading}>
                                    {actionLoading ? 'Assigning...' : 'Update Assignment'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'status' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-bold">Internal Status</label>
                                <select
                                    className="input"
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    disabled={selectedLead.status === 'Closed'}
                                >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Credit Approved">Credit Approved</option>
                                    <option value="Disbursed">Disbursed</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                {newStatus === 'Rejected' && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
                                        Note: Lead will be marked as rejected.
                                    </div>
                                )}

                                {(newStatus === 'Closed' || newStatus === 'Disbursed') && (
                                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
                                        Note: Changing status to {newStatus}. {newStatus === 'Closed' ? 'Lead will be locked.' : ''}
                                    </div>
                                )}

                                {selectedLead.status === 'Closed' && (
                                    <div className="bg-red-50 p-2 rounded text-xs text-red-800 mb-4 border border-red-100">
                                        Locked: This lead is Closed and status cannot be changed.
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleWebLeadStatusUpdate}
                                    disabled={actionLoading || selectedLead.status === 'Closed'}
                                >
                                    {actionLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>



            {
                isCreateOpen && (
                    <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white flex flex-col rounded-xl shadow-xl max-w-xl w-full h-[90vh] overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-white z-10">
                                <h2 className="text-xl font-bold">Create New Lead</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <ScrollArea className='flex-1 min-h-0'>
                                <div className="p-6 space-y-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Client Name</label>
                                            <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">City</label>
                                            <input className="input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Phone</label>
                                            <input className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Product Type Selection */}
                                    <div>
                                        <label className="label">Product Type</label>
                                        <select className="input" value={formData.product_type} onChange={e => setFormData({ ...formData, product_type: e.target.value, product_details: {} })}>
                                            <option value="unlisted">Unlisted Shares</option>
                                            <option value="stocks">Bulk Stocks</option>
                                            <option value="insurance">Insurance</option>
                                            <option value="loans">Loans</option>
                                            <option value="equity">Private Equity/Funding </option>
                                        </select>
                                    </div>

                                    {/* Dynamic Requirements */}
                                    <div className="p-4 bg-gray-50 rounded border">
                                        <h4 className="font-bold text-sm mb-3 text-gray-700">Requirement Details</h4>
                                        <div className="space-y-3">
                                            {PRODUCT_FORMS[formData.product_type]?.map((field) => {
                                                // Check conditional visibility
                                                if (field.conditional) {
                                                    const relatedValue = formData.product_details[field.conditional.fieldId];
                                                    const conditionMet = Array.isArray(field.conditional.value)
                                                        ? field.conditional.value.includes(relatedValue)
                                                        : relatedValue === field.conditional.value;

                                                    if (!conditionMet) return null;
                                                }

                                                return (
                                                    <div key={field.id} className="w-full">
                                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                                        </label>

                                                        {field.type === 'select' && (
                                                            <select
                                                                className="input w-full text-sm"
                                                                value={formData.product_details[field.id] || ''}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    product_details: { ...formData.product_details, [field.id]: e.target.value }
                                                                })}
                                                            >
                                                                <option value="">Select {field.label}</option>
                                                                {field.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {field.type === 'radio' && (
                                                            <div className="flex gap-4 pt-1">
                                                                {field.options?.map(opt => (
                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={field.id}
                                                                            className="w-4 h-4 text-blue-600"
                                                                            checked={formData.product_details[field.id] === opt}
                                                                            onChange={() => setFormData({
                                                                                ...formData,
                                                                                product_details: { ...formData.product_details, [field.id]: opt }
                                                                            })}
                                                                        />
                                                                        <span className="text-sm">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {(field.type === 'text' || field.type === 'number' || field.type === 'email' || field.type === 'date') && (
                                                            <input
                                                                type={field.type}
                                                                className="input w-full text-sm"
                                                                placeholder={field.placeholder || `Enter ${field.label}`}
                                                                value={formData.product_details[field.id] || ''}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    product_details: { ...formData.product_details, [field.id]: e.target.value }
                                                                })}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {!PRODUCT_FORMS[formData.product_type] && (
                                                <div className="text-center text-gray-400 text-sm py-4">
                                                    No specific configuration for this product.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="btn btn-primary w-full py-3" onClick={() => {
                                        handleSubmit();
                                    }} disabled={actionLoading}>
                                        {actionLoading ? 'Creating...' : 'Create Lead'}
                                    </button>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )
            }

            {/* Incentive Confirmation Modal */}

        </div >
    )
}

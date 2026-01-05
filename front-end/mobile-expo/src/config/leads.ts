export type FieldType = 'text' | 'number' | 'email' | 'select' | 'radio' | 'date' | 'checkbox' | 'multiselect';

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

export interface ProductConfig {
    id: string;
    label: string;
    description?: string;
    fields: LeadField[];
}

export const COMMON_LEAD_FIELDS: LeadField[] = [
    // {
    //     id: 'leadType',
    //     label: 'Lead Type',
    //     type: 'radio',
    //     options: ['Self', 'Partner', 'Referral Partner', 'Cold Reference'],
    //     required: true
    // },
    // {
    //     id: 'referrerName',
    //     label: 'Referrer Name / Partner Code',
    //     type: 'text',
    //     required: false
    // },
    {
        id: 'relationship',
        label: 'Relationship with Client',
        type: 'select',
        options: ['Self', 'Client', 'Known', 'Referred'],
        required: true
    },
    {
        id: 'clientName',
        label: 'Client Name',
        type: 'text',
        required: true
    },
    {
        id: 'mobile',
        label: 'Mobile Number',
        type: 'number', // Input type phone-pad
        required: true
    },
    {
        id: 'email',
        label: 'Email ID',
        type: 'email',
        required: true
    },
    {
        id: 'location',
        label: 'City & State',
        type: 'text',
        required: true
    },
    {
        id: 'clientType',
        label: 'Client Type',
        type: 'select',
        options: ['Individual', 'Self-Employed', 'Proprietorship', 'Partnership', 'Pvt Ltd', 'LLP'],
        required: true
    }
];

export const PRODUCT_CATEGORIES = [
    { id: 'insurance', label: 'Insurance' },
    { id: 'loans', label: 'Loans' },
    { id: 'equity', label: 'Private Equity / Funding' },
    { id: 'unlisted', label: 'Unlisted Shares' },
    { id: 'stocks', label: 'Bulk Listed Stock Deals' }
];

export const PRODUCT_FORMS: Record<string, LeadField[]> = {
    insurance: [
        { id: 'insuranceType', label: 'Insurance Type', type: 'select', options: ['Life', 'Health', 'Motor'], required: true },
        { id: 'budget', label: 'Annual Premium Budget (₹)', type: 'number', required: true },
        { id: 'coverage', label: 'Coverage Required (₹)', type: 'number', required: true },
        { id: 'existingPolicy', label: 'Existing Policy', type: 'radio', options: ['Yes', 'No'], required: true },
        // { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], required: true },
        

        // Life
        { id: 'productType', label: 'Product Type', type: 'radio', options: ['Term', 'Saving','Investment'], conditional: { fieldId: 'insuranceType', value: 'Life' } },
        { id: 'age', label: 'Age', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
        { id: 'income', label: 'Annual Income', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
        { id: 'occupation', label: 'Occupation', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Life' } },
        //{ id: 'coverage', label: 'Coverage Required (₹)', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Life' } },
        { id: 'smoker', label: 'Smoker', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Life' } },
        { id: 'alcoholic', label: 'Alcoholic', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Life' } },

        // Health
        { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], conditional: { fieldId: 'insuranceType', value: 'Health' }  },
        { id: 'policyType', label: 'Policy Type', type: 'radio', options: ['Individual', 'Family Floater'], conditional: { fieldId: 'insuranceType', value: 'Health' }  },
        { id: 'memberAges', label: 'Age of Insured Members', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
        { id: 'membersCovered', label: 'Family Members to be Covered', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
        { id: 'conditions', label: 'Existing Medical Conditions', type: 'text', conditional: { fieldId: 'insuranceType', value: 'Health' } },
        { id: 'sumInsured', label: 'Sum Insured Required (₹)', type: 'number', conditional: { fieldId: 'insuranceType', value: 'Health' } },
        { id: 'smoker', label: 'Smoker', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Health' } },
        { id: 'alcoholic', label: 'Alcoholic', type: 'radio', options: ['Yes', 'No'], conditional: { fieldId: 'insuranceType', value: 'Health' } },

        // Motor
        { id: 'policyStatus', label: 'Status', type: 'radio', options: ['Policy Renewal', 'New Purchase'], conditional: { fieldId: 'insuranceType', value: 'Motor' }  },
        { id: 'policyType', label: 'Policy Type', type: 'radio', options: ['Third Party', 'Comprehensive'], conditional: { fieldId: 'insuranceType', value: 'Motor' }  },
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
        { id: 'amount', label: 'Loan Amount Required (₹)', type: 'number', required: true , conditional: { fieldId: 'loanType', value: ['Home', 'Personal', 'Business', 'Mortgage', 'Education', 'Car', 'Machinery', 'WC', 'FTL', 'Channel Financing'] } },
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
        { id: 'collageName', label: 'Collage Name', type: 'text',  conditional: { fieldId: 'loanType', value: ['Education'] } },

        // Additional Field in Car loan
        { id: 'assetType', label: 'Asset Type', type: 'select', options: ['New', 'Used'], conditional: { fieldId: 'loanType', value: ['Car'] } },
        { id: 'carMktValue', label: 'Car Mkt value (₹)', type: 'text', conditional: { fieldId: 'loanType', value: ['Car'] } },

        // Additional Field in WC loan
        { id: 'businessType', label: 'Business Type', type: 'text', conditional: { fieldId: 'loanType', value: ['WC'] } },
        { id: 'currentBankingRelationship', label: 'Current Banking Relationship', type: 'radio', options: ['OD', 'CC','Invoice discounting'], conditional: { fieldId: 'loanType', value: ['WC'] } },

        // Additional Field in Construction
        { id: 'fundingRequired', label: 'Funding Required', type: 'text', required:true, conditional: { fieldId: 'loanType', value: ['Construction', 'Project Finance', 'RBF'] } },
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

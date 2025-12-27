export type QuestionType = 'text' | 'select' | 'multiselect';

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    placeholder?: string;
    required?: boolean;
}

export interface OnboardingFlow {
    type: 'Partner' | 'Customer' | 'Referral Partner';
    steps: {
        title: string;
        questions: Question[];
    }[];
}

const PARTNER_FLOW: OnboardingFlow = {
    type: 'Partner',
    steps: [
        {
            title: 'Basic Details',
            questions: [
                { id: 'fullName', type: 'text', question: 'What is your full name?', required: true, placeholder: 'Enter your full name' },
                { id: 'location', type: 'text', question: 'Where are you located?', required: true, placeholder: 'City, Country' }
            ]
        },
        {
            title: 'Professional Profile',
            questions: [
                {
                    id: 'activityStatus',
                    type: 'select',
                    question: 'Are you active in wealth/financial distribution?',
                    options: [
                        'Yes, actively managing clients',
                        'Somewhat active (side income)',
                        'Not yet, but interested to start',
                        'Exploring opportunities'
                    ],
                    required: true
                }
            ]
        },
        {
            title: 'Business Potential',
            questions: [
                {
                    id: 'products',
                    type: 'multiselect',
                    question: 'Which products would you like to offer?',
                    options: [
                        'Unlisted Shares',
                        'Pre-IPO Opportunities',
                        'Private Equity / Structured Deals',
                        'Insurance (Life / Health / General)',
                        'Loans (Home, Business, LAP, etc.)',
                        'Mutual Funds & Fixed Deposits',
                        'Not sure – want guidance'
                    ],
                    required: true
                },
                {
                    id: 'clientBase',
                    type: 'select',
                    question: 'Approximate client base you can tap into?',
                    options: ['0-10', '10-50', '50-100', '100+', 'Corporate / HNI network'],
                    required: true
                }
            ]
        },
        {
            title: 'Goals & Timeline',
            questions: [
                {
                    id: 'expectations',
                    type: 'multiselect',
                    question: 'What are you looking for from Rich Harbor?',
                    options: [
                        'Free tech platform',
                        'Additional income source',
                        'Access to Pre-IPO / Unlisted',
                        'Faster execution & better deals',
                        'White-label / scalable business',
                        'Learning & support'
                    ],
                    required: true
                },
                {
                    id: 'timeline',
                    type: 'select',
                    question: 'How soon would you like to start?',
                    options: ['Immediately', 'Within 30 days', 'In 1–3 months', 'Just exploring'],
                    required: true
                }
            ]
        },
        {
            title: 'Connect',
            questions: [
                {
                    id: 'connectPreference',
                    type: 'select',
                    question: 'Would you like a quick walkthrough?',
                    options: ['Yes, please call me', 'Yes, WhatsApp is fine', 'Not now'],
                    required: true
                }
            ]
        }
    ]
};

const REFERRAL_PARTNER_FLOW: OnboardingFlow = {
    type: 'Referral Partner',
    steps: PARTNER_FLOW.steps // Using same flow for now as requested
};

const CUSTOMER_FLOW: OnboardingFlow = {
    type: 'Customer',
    steps: [
        {
            title: 'Basic Details',
            questions: [
                { id: 'fullName', type: 'text', question: 'Full Name', required: true },
                { id: 'location', type: 'text', question: 'Location', required: true },
            ]
        },
        {
            title: 'Interests',
            questions: [
                {
                    id: 'interests',
                    type: 'multiselect',
                    question: 'What are you interested in?',
                    options: [
                        'Unlisted Shares',
                        'Pre-IPO Opportunities',
                        'Wealth Management',
                        'Insurance',
                        'Loans',
                        'Just exploring'
                    ],
                    required: true
                }
            ]
        }
    ]
};

export const ONBOARDING_CONFIG: Record<string, OnboardingFlow> = {
    'Partner': PARTNER_FLOW,
    'Referral Partner': REFERRAL_PARTNER_FLOW,
    'Customer': CUSTOMER_FLOW
};

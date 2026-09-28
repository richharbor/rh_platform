# RFIN — Complete Functionality & App UI/UX Report

**Source:** Merged RFIN UI/UX blueprint presentation (`merged_presentation_choladeck.pptx`)

**Source deck size:** 134 slides

**Report scope:** Consolidated functional requirements, app UI/UX requirements, user journeys, business/operational workflows, data/state requirements, private-market experience, rewards, partner experience, and implementation handoff requirements.

**Important:** This report is derived from the supplied RFIN decks. Where the decks identify a future phase, recommendation, optional mechanism, or unresolved product decision, it is explicitly marked rather than silently treated as a confirmed requirement.

---

## Executive Summary

The five merged RFIN blueprints describe one connected financial platform rather than five independent applications. The product combines:

- Consumer financial-product discovery and transactions
- Customer 360 and personalized recommendations
- Insurance, lending and investment journeys
- Unlisted/private-market discovery, research, buying, selling and portfolio management
- Partner registration and Partner 360
- Partner lead, case, client and earnings management
- Referrals and partner growth
- RFIN Points, transaction benefits, gift cards and lucky draws
- Notifications, documents, KYC, support and auditability
- Operations/admin tooling, payouts, reconciliation, fraud/risk and campaign management

The core product principle is a unified experience: **One ID → One Home → Need/Goal → Match → Understand → Transact → Track → Manage → Earn → Grow.**

---

# 95-Point Functional & UI/UX Specification

## A. Product Foundation & Experience Architecture

### 1. One unified RFIN experience
RFIN should be experienced as one financial operating system, not as five disconnected products. Customer, rewards, partner, private-market and transaction experiences should share identity, navigation, design language, state handling and support.

### 2. One customer identity / RFIN ID
A single RFIN ID should identify a person across personal buying, selling, referrals and partner activity. The same person should not need duplicate accounts for Buyer, Seller or Referral Partner roles.

### 3. Role switching
The account should support role switching between **Buyer, Seller and Referral Partner**, with Partner mode exposing deeper operational capabilities. Role switching should preserve identity while changing context and available actions.

### 4. Need/goal-first discovery
The primary discovery model should begin with the user's requirement rather than forcing the user to understand financial-product categories first. Core needs include Grow Wealth, Protect Family, Need Funding, Invest Surplus, Sell an Asset, Save/Plan, Find an Opportunity and Refer Someone.

### 5. Core product north-star journey
The product should support the continuous journey: **Need → Match → Understand → Transact → Track → Manage → Earn → Grow.** This should guide information architecture, analytics and screen design.

### 6. Progressive disclosure
Complex financial information should be revealed progressively. Users should first see the decision-critical information, then detailed eligibility, fees, risks, documents and supporting information when needed.

### 7. Progressive KYC
KYC should be requested at the point it becomes necessary rather than making every new user complete a large form before exploring the platform. The system should preserve incomplete progress and explain exactly what remains.

### 8. Transparent transaction status
Every application, order, payment, KYC process, document request, provider confirmation and fulfilment process needs a visible status. The user should never be left wondering what happened after pressing a CTA or making a payment.

### 9. Human support escape route
Every important financial journey should provide an appropriate human support path: contextual chat/call, relationship manager where applicable, document assistance, transaction escalation, grievance path and FAQs/explainers.

### 10. Financial clarity before gamification
Rewards should increase engagement without overpowering suitability, risk, disclosure or financial decision-making. Rewards are a secondary engagement layer, not a replacement for financial-product information.

---

## B. Customer Registration, Profile & Customer 360

### 11. Welcome / entry experience
The entry experience should clearly communicate what RFIN offers and provide paths such as **Invest, Protect, Borrow, Sell and Refer**. The user should be able to understand the platform before being forced into a long registration flow.

### 12. Mobile and OTP registration
Initial registration should use mobile number + OTP, with name/email/city and other basic information captured progressively. Optional referral or partner attribution should be supported.

### 13. Save-and-resume onboarding
Incomplete registration, KYC and applications should be saved. When the user returns, the app should show the last completed stage and the next required action.

### 14. Basic customer profile
The profile should support name, date of birth where required, occupation, city/location, email, mobile and relevant personal details. Sensitive fields should be requested only where justified.

### 15. Financial profile
Customer 360 should include financial context such as income band, investible capacity, financial goals, risk preference, investment horizon, liquidity needs and existing products.

### 16. Existing products and holdings
The customer profile should be able to represent existing investments, insurance, loans and unlisted holdings. This data becomes an input to personalization and cross-sell opportunities.

### 17. Goal tracking
Goals should eventually become first-class objects, allowing RFIN to understand why a customer is exploring a product and support future goal tracking and proactive recommendations.

### 18. Customer 360 architecture
Customer 360 should combine identity, profile, financial profile, existing products, eligibility, applications, orders/transactions, portfolio, rewards, referrals and consent/audit information.

### 19. Profile completeness
The Home/Profile experience should show meaningful profile completion where additional information unlocks better recommendations, faster transactions or eligibility checks.

### 20. Customer data privacy and consent visibility
Consent should be explicit and auditable. The user should be able to understand relevant communication preferences, data permissions, agreements and consent history.

---

## C. Explore, Product Discovery & Personalization

### 21. Explore hub
Explore should act as the product/opportunity discovery layer. It should support categories such as Protect, Borrow, Invest, Private Markets, Sell and relevant tools.

### 22. Personalized “For You” layer
The system should surface relevant products, incomplete journeys, unlocked benefits, referral opportunities and next-best actions based on Customer 360 signals.

### 23. Product catalogue
Products should be represented in a structured catalogue with provider, category, eligibility, requirements, fees/costs, risk/disclosure information, availability and transaction capability.

### 24. Product cards
Product cards should communicate what the product is, why it may matter, key eligibility information and the primary action without requiring the user to open every product page.

### 25. Product detail page
Every product detail screen should answer five questions: **What is it? Who is it for? What does it require/cost? What are the important risks/limitations? What happens next?**

### 26. Compare experience
Where multiple options are relevant, users should be able to compare them on decision-critical dimensions rather than opening many disconnected screens.

### 27. Eligibility check
Eligibility should be presented as a dedicated step. The UI must distinguish indicative eligibility from confirmed/provider-verified eligibility.

### 28. Recommendation transparency
Where RFIN recommends a product or next action, the UI should communicate relevant reasoning such as goal, eligibility, existing relationship or need — without presenting a recommendation as a guarantee.

### 29. Search and filters
Discovery should support search, category filters, product type, eligibility, investment amount, sector/theme and other context-specific filters. Private-market discovery has a deeper filter system described separately below.

### 30. Personalized next-best-action engine
Customer profile, financial context, goals, existing products, behaviour, eligibility and communication preferences should feed a next-best-product/next-best-action engine.

---

## D. Unified Transaction, KYC & Application Flow

### 31. Unified transaction engine
The core transaction pattern should be reusable across financial journeys: **Review → Consent → KYC → Order/Application → Pay → Fulfil → Track.**

### 32. Review step
Before submission/payment, the customer should see a clear summary of the product, selected quantity/coverage/loan amount or other relevant transaction details, charges, terms and next steps.

### 33. Consent step
The system should capture the necessary declarations, product consent, privacy/data consent, terms and other applicable acknowledgements before proceeding.

### 34. KYC checklist
KYC should be represented as an explicit checklist/progress component. Missing or failed items should be explained rather than simply showing a generic “KYC pending”.

### 35. Document upload
The app should support secure document upload with document type, status, validation result, re-upload capability and clear reason when a document is rejected.

### 36. Bank verification
Where required for transactions, payouts or settlement, bank details should be collected and verified with a visible verification status.

### 37. Payment handling
Payment states should include pending, successful, failed, cancelled and potentially refunded/reversed. Duplicate payment must be prevented through backend idempotency and clear UI locking.

### 38. Application/order tracking
After submission, the user should get a timeline showing what has completed, what is pending, what RFIN/provider is doing and whether the user must act.

### 39. Action-required state
Every action-required state should have one obvious next CTA. Examples include upload document, complete KYC, verify bank, approve terms or provide additional information.

### 40. Completion and document delivery
Successful completion should show confirmation, transaction/application reference and relevant documents. The same information should remain available in Activity and Documents.

---

## E. Home, Activity, Portfolio & Support

### 41. Personalized Home dashboard
Home should combine greeting/profile completeness, active applications, pending actions, financial products, relevant opportunities, benefits and support. It should evolve as RFIN learns about the customer.

### 42. Home information hierarchy
The recommended narrative order is: **Money → Action → Opportunity → Products → Rewards → Education → Trust.**

### 43. Persistent primary actions
Invest/Protect/Borrow/Sell/Refer should remain easily discoverable. They are action concepts and do not necessarily need to become separate bottom-navigation tabs.

### 44. Activity centre
Activity should consolidate applications, orders, payments, KYC, documents, status changes, refunds/payouts and action-required items.

### 45. Portfolio / My Financial Life
The long-term destination should combine Investments, Insurance, Loans, Unlisted Holdings, Documents and Goals, with future scope for consolidated external portfolio data.

### 46. Documents centre
Customers should have a single place for policy documents, transaction documents, KYC documents, statements and other generated/received records.

### 47. Contextual support
Support should know the relevant product/order/case context so the customer does not need to explain the entire issue from scratch.

### 48. Notifications centre
Notifications should cover onboarding, KYC, applications, payment, orders, benefits, lucky-draw progress, draw results/status, referrals and important product updates.

### 49. Notification controls
Push, in-app, email and other channels such as WhatsApp/SMS should be used where permitted and consented. Notifications should avoid excessive promotional messaging.

### 50. Customer state design
The UX must support **Draft, KYC Pending, Eligibility Pending, Payment Pending, Order Pending, Action Required, Completed, Rejected, Cancelled and Expired** states with appropriate recovery paths.

---

## F. Rewards, RFIN Points & Benefits

### 51. Rewards as a core product layer
Rewards should be integrated into the customer journey rather than presented as isolated promotional pop-ups.

### 52. Welcome reward
The deck specifies a welcome mechanism around **1,000 RFIN Points**. The UI should clearly show whether the points are pending/earned, their value/conversion rule, expiry if applicable and terms.

### 53. Separate rewards ledger
RFIN Points must remain distinct from cash, commission, payout and promotional-benefit ledgers. These balances should never be collapsed into a single “money” balance.

### 54. First-transaction mechanic
The first eligible transaction should trigger the configured reward/benefit flow. Eligibility must be rule-driven, not determined by the UI.

### 55. Reward engine
The backend reward sequence should be conceptually: **Campaign Rule → Eligibility Rule → Transaction Event → Reward Calculation → Point Ledger → Conversion/Benefit Ledger → Notification.**

### 56. Reward states
The deck defines reward/point lifecycle concepts including **Issued → Locked → Eligible → Converted**, with possible **Expired / Reversed** outcomes.

### 57. Transaction benefits
Eligible transactions can unlock configured benefits such as personalized gift cards or loaded cards. Benefit status should move through **Earned → Processing → Issued → Redeemed** or equivalent configured states.

### 58. Gift-card detail screen
Gift-card/loaded-card screens should show benefit type, value/denomination, issuer/fulfilment partner, issue date, validity/expiry, redemption instructions, terms, support and transaction reference.

### 59. Benefits hub
A single Rewards/Benefits hub should show Available Now, Pending Benefits, Unlock Next and additional campaigns/partner benefits.

### 60. Benefit status accuracy
The UI must never present an uncertain or conditional benefit as guaranteed. Backend eligibility and fulfilment status are authoritative.

---

## G. Lucky Draw, Referral & Reward Engagement

### 61. Lucky-draw progress
The core campaign mechanic described in the deck is a minimum of three eligible transactions, visualized as **0/3 → 1/3 → 2/3 → 3/3**.

### 62. Lucky-draw campaign detail
The user should see campaign name, start/end period where relevant, draw date/schedule, prize information, eligibility rules, number of entries if applicable and terms.

### 63. Lucky-draw eligibility event
When the transaction threshold is reached, the system should create an eligibility record/entry, assign a unique entry ID, freeze the eligibility snapshot, link it to the campaign and write an audit record.

### 64. Lucky-draw result/status
The customer should be able to see draw status, history, result and prize status. Additional entries should only be displayed if the campaign rules explicitly support them.

### 65. Campaign configuration
Campaigns should be configurable from Admin rather than hard-coded into screens. Product eligibility, dates, transaction thresholds, benefit values, caps, expiry and terms should be rule-driven.

### 66. Referral journey
The referral flow should be simple: select a requirement → generate link/QR/WhatsApp share → track referral → show status → reward when eligible.

### 67. Referral states
Referral progress should support states such as **Pending → Approved → Paid**, with a separate referral ledger.

### 68. Rewards timeline
Customers should have an audit-friendly reward timeline showing signup points, first transaction, benefit issuance, transaction progress, lucky-draw eligibility and referral rewards.

### 69. Rewards tiers
The visual blueprint describes tier concepts such as Bronze, Silver, Gold, Platinum and Elite. Tier rules must be configurable and compliance-approved rather than embedded as fixed assumptions.

### 70. Reward fraud and reversals
The reward system should detect duplicate accounts, device duplication, self-referrals, referral loops, rapid reversals, repeated cancellations and duplicate transaction events. Rewards must be reversible and auditable.

---

## H. Partner Registration & Partner 360

### 71. Low-friction partner onboarding
Partner registration targets approximately **5–8 minutes for initial registration**, followed by progressive verification.

### 72. Six Partner 360 dimensions
Partner onboarding should build six dimensions: **Identity, Capability, Network, Intent, Compliance and Growth.**

### 73. Partner type selection
Supported partner types include Financial Advisor/Distributor, Wealth Manager/Private Banker, DSA/Loan Partner, Insurance Professional, CA/Professional, Corporate/Institution, Individual/Referral and Other/manual review.

### 74. Partner basic profile
Basic information includes name, photo where applicable, DOB where required, email/mobile, city/state, organization/firm, designation and experience.

### 75. Professional capability profile
The professional profile should capture current/previous organizations, financial-services experience, product experience, certifications/licences where applicable, business model, existing products handled, team size and optional professional profile link.

### 76. Product capability matrix
Partner capabilities should be captured across categories such as Unlisted/Private Markets, Life, Health/General Insurance, Loans, IPO, Bonds/Fixed Income, Mutual Funds and alternatives where applicable. Interest/experience/opportunity potential should be represented through structured selections.

### 77. Network profile
Partner network data should include client-base ranges, geography and access to HNI/UHNI/NRI/corporate segments. Exact client lists should not be required merely for segmentation.

### 78. Business potential
The partner profile should capture annual business range, monthly lead volume, successful cases, average ticket, meeting frequency, referral capability, corporate introductions and expected opportunity where relevant.

### 79. Partner KYC and compliance
Partner KYC should support PAN, identity/address verification, face verification where applicable, bank verification, regulatory certificates, company/GST/business documents, declarations, eSign and consent.

### 80. Partner bank and payout setup
Partner bank details, account verification, payout preference/threshold, applicable TDS and payout terms should be represented in a dedicated financial setup flow.

---

## I. Partner Operations, Earnings & Opportunity Engine

### 81. Partner activation
After verification, the partner should receive a Partner ID and access to recommended products, earnings, leads, training, marketing resources and support.

### 82. Partner dashboard
The Partner Home should surface active leads, leads requiring action, cases in processing, potential value, converted cases, earnings and next-best actions.

### 83. Lead creation
Adding a lead should be optimized for speed. The intended flow is **Client → Need → Company/Product → Quantity → Documents → Submit**, targeting approximately a 60-second lead creation experience.

### 84. Partner pipeline
The partner pipeline should support **New → Contacted → Qualified → Processing → Converted → Lost** and always expose the next action.

### 85. Client 360
A partner should not need multiple screens to understand a client. Client 360 should include profile, segment, geography, holdings, active opportunities, requirements, products held/advised, cases, documents, communication/notes and next action.

### 86. Case 360
Case 360 should show order/case reference, current stage, owner, next action, SLA and a timeline such as KYC verified, payment received, transfer initiated and document requested.

### 87. Opportunity engine
The opportunity engine combines client signals such as holdings, interests, liquidity, risk and concentration with market/product signals and campaigns to generate next-best opportunities.

### 88. Money Centre / three-ledger model
Partner earnings must separate **Business Earnings/Commission**, **RFIN Points** and **Promotional Benefits**. Each should have independent balances, history and accounting/audit semantics.

### 89. Payout management
Partner earnings should support Pending, Available and Paid states, with transaction/case linkage and payout history. Reconciliation and exception handling are required operational capabilities.

### 90. Partner growth layer
Partner growth should eventually include recommendations, training, marketing resources, referrals, cross-sell opportunities, performance/activity insights and team capabilities where applicable.

---

## J. Unlisted Shares / Private Markets

### 91. Private-market discovery and research
The private-market experience should support **Discover → Understand → Transact → Manage**. Users should be able to search companies, explore sectors/themes, view curated opportunities, watchlist companies and discover new supply.

The company experience should include Overview, Business, Financials, Valuation, Peers, Risks, Documents and Transaction information. The design goal is to make an opaque asset class structured, premium and decision-ready.

Valuation terminology must distinguish **Current Indicative Price, Latest Funding Round, Secondary Trade and Indicative Mark** rather than implying that all numbers represent the same type of market price.

### 92. Private-market buy flow
The buy flow should be: **Select → Quantity → Review → KYC → Pay → Transfer → Portfolio**. The review stage should expose price/share, quantity, consideration, fees/taxes, total and expected timeline.

### 93. Private-market sell and price discovery
The sell flow should be: **Verify Holding → Discover → List → Match → Approvals → Transfer → Paid**. Price discovery should expose available evidence such as latest trade, verified price, indicative bid/ask where available, target price and buyer interest. Transfer restrictions, ROFR/approval requirements and settlement constraints must be visible.

### 94. Private-market portfolio, alerts and intelligence
Portfolio should show holdings, quantity, cost basis, indicative value, indicative gain/loss, liquidity, concentration, sector distribution, valuation context, company updates, statements and sell interest. The UI must distinguish **indicative gain from realized gain**.

Watchlists/alerts should support price, availability, bid/ask where available, company updates, liquidity, valuation milestones, order events and payout events. Research, education and event content should be decision-oriented rather than social-media-like.

### 95. Operations, design system, analytics, architecture and delivery readiness
RFIN requires an operations-first foundation and a reusable design system. Admin/Operations should cover users, leads, cases, products, providers, payouts, rewards, campaigns, lucky draws, inventory, orders, KYC, transfers, reconciliation, risk/fraud, analytics and audit.

The shared UI system should include reusable Earnings Cards, Product Cards, Lead Cards, Reward Cards, Status Chips, CTAs, Steppers, Bottom Sheets, Timelines, Empty States, Trust Banners, Toasts, skeleton/loading states and error/success/pending/locked states.

The architecture should separate major capabilities into reusable services/modules such as Identity, Customer 360, Partner 360, Product Catalogue, Eligibility, KYC, Transactions, Portfolio, CRM/Leads, Opportunity Engine, Rewards, Campaigns, Lucky Draw, Notifications, Documents, Payouts, Reconciliation, Risk/Fraud, Analytics and Admin/Operations.

Every important CTA and state transition should generate analytics events. Reward and financial transactions require idempotency, immutable/auditable records, rule versioning, reconciliation and reversal capability.

The recommended delivery order from the blueprints is to build the **information architecture → design system → interactive prototypes → design QA → developer handoff → analytics mapping**, rather than creating isolated screens independently.

---

# Detailed Screen & Module Inventory

## Customer

- Welcome / entry
- Login
- OTP
- Basic profile
- Financial profile
- Goal / need discovery
- Explore
- Product list
- Product detail
- Compare
- Eligibility
- KYC checklist
- Document upload
- Bank verification
- Consent
- Application
- Payment
- Success
- Activity
- Order tracking
- Portfolio / My Financial Life
- Documents
- Support
- Notifications
- Profile / Security / Preferences

## Rewards

- Welcome reward
- RFIN Points wallet
- Points detail
- Benefit detail
- Gift card / loaded card
- Benefits hub
- Lucky draw progress
- Lucky draw campaign detail
- Lucky draw eligibility confirmation
- Draw status/result
- Reward timeline
- Referral creation
- Referral tracking
- Tier/loyalty view
- Campaign detail

## Partner

- Partner welcome
- OTP
- Partner type
- Basic profile
- Professional profile
- Product capability/interests
- Network profile
- Business potential
- KYC
- Document upload
- Bank/payout
- Agreement/consent
- Review
- Verification
- Partner ID
- Activation
- Partner 360
- Edit profile
- Training
- Marketing resources
- Support

## Partner Operations

- Partner dashboard
- Lead dashboard
- Add lead
- Pipeline
- Client 360
- Opportunity engine
- Case 360
- Earnings
- Payouts
- Documents
- Tasks/action required
- Activity
- Notifications

## Private Markets

- Private-market Home
- Search
- Filters
- Company list
- Themes
- New Supply
- Watchlist
- Company overview
- Business
- Financials
- Valuation
- Peers
- Risks
- Documents
- Buy flow
- Buy review
- KYC
- Payment
- Order status
- Transfer status
- Sell flow
- Holding verification
- Price discovery
- Listing
- Buyer interest
- Approval
- Settlement
- Portfolio
- Performance
- Valuation
- Concentration
- Liquidity
- Statements
- Alerts
- Research feed
- Education
- Events

## Operations/Admin

- Users
- Leads
- Cases
- Products
- Providers
- KYC queue
- Orders
- Inventory
- Transfers
- Payouts
- Rewards
- Campaigns
- Lucky draws
- Gift-card/benefit fulfilment
- Reconciliation
- Risk/fraud
- Analytics
- Audit
- Documents
- Support/escalations

---

# Recommended Navigation

## Customer-facing navigation

1. **Home** — personalized dashboard, active journeys, next actions, opportunities
2. **Explore** — products, opportunities, tools and private markets
3. **Activity** — applications, orders, documents, status
4. **Rewards** — RFIN Points, benefits, gift cards, lucky draw, referrals
5. **Profile** — identity, KYC, bank, documents, preferences, security

The visual blueprint later uses **Home / Explore / Earn / Rewards / Profile** for the broader three-sided network. The product should therefore treat navigation as role/context-aware while retaining the same identity.

---

# Recommended Private-Market Navigation

- Home
- Explore
- Companies
- Sectors / Themes
- Search
- Watchlist
- Orders
- Buy
- Sell
- Portfolio
- Research
- Alerts
- Profile

For Partner mode, use **Investor ↔ Partner** role switching rather than creating a separate application.

---

# Core State Model

A common state model should be reused across journeys wherever possible:

```text
DRAFT
  ↓
SUBMITTED
  ↓
PENDING / PROCESSING
  ↓
ACTION REQUIRED  ← user intervention
  ↓
COMPLETED
```

Terminal/exception states:

```text
REJECTED
CANCELLED
EXPIRED
FAILED
REVERSED
```

Examples:

- KYC: Not Started → In Progress → Action Required → Verified / Failed / Expired
- Payment: Initiated → Pending → Success / Failed / Reversed
- Order: Draft → Submitted → Processing → Fulfilled / Rejected / Cancelled
- Reward: Issued → Locked → Eligible → Converted / Expired / Reversed
- Gift Card: Processing → Ready → Used / Partially Used / Expired
- Lucky Draw: Not Eligible → Progress → Eligible → Entry Confirmed → Draw Result
- Lead: New → Contacted → Qualified → Processing → Converted / Lost

---

# Core Data Model

## Customer

- Customer
- CustomerProfile
- FinancialProfile
- ExistingProduct
- Goal
- Eligibility
- Application
- Order / Transaction
- Portfolio
- RewardLedger
- Referral
- Consent / Audit

## Partner

- Partner
- PartnerProfile
- PartnerCapability
- PartnerNetwork
- PartnerKYC
- PartnerBank
- PartnerAgreement
- PartnerScore
- PartnerDocuments
- PartnerActivity
- Lead
- Case
- Client360
- Payout

## Rewards

- RewardCampaign
- CampaignRule
- EligibilityRule
- RewardEvent
- PointLedger
- BenefitLedger
- GiftCard / LoadedCard
- LuckyDrawCampaign
- LuckyDrawEntry
- Prize
- ReferralReward
- Tier
- RewardAudit

## Private Markets

- Company
- CompanyProfile
- Security/ShareClass
- IndicativePrice
- FundingRound
- SecondaryTrade
- Inventory
- Watchlist
- BuyOrder
- SellOrder
- BuyerInterest
- TransferCase
- Settlement
- PrivatePortfolio
- ResearchDocument
- CompanyUpdate
- Alert

---

# Backend / Service Architecture Implied by the Blueprint

```text
RFIN App / Web
       |
       +-- Identity & Access
       +-- Customer 360
       +-- Partner 360
       +-- Product Catalogue
       +-- Eligibility Engine
       +-- KYC / Verification
       +-- Transaction / Order Engine
       +-- Portfolio
       +-- CRM / Leads / Cases
       +-- Opportunity Engine
       +-- Rewards Engine
       +-- Campaign Engine
       +-- Lucky Draw Engine
       +-- Notification Service
       +-- Document Service
       +-- Payout Service
       +-- Reconciliation
       +-- Risk / Fraud
       +-- Analytics
       +-- Admin / Operations
```

External integrations are expected to vary by implementation and are not fully specified in the deck. Potential integration categories explicitly implied by the journeys include KYC/identity providers, payment providers, financial-product providers, gift-card/benefit fulfilment providers, notification providers, bank verification, private-market transfer/settlement infrastructure and partner/provider APIs.

---

# UI/UX Design System Requirements

## Visual direction

The blueprint positions RFIN as a **premium financial operating system** combining fintech, marketplace, private-market research and rewards.

### Typography

- Inter / SF Pro-style typography
- High numerical legibility
- Approximate hierarchy from the visual blueprint: 12–28px
- Larger numerical emphasis for money, earnings and portfolio values

### Colour semantics

The visual blueprint proposes semantic colour roles:

- Navy — trust / data
- Green — action / growth
- Gold — premium / insight
- Blue — information
- Purple — rewards

### Components

- 16–20px radius range
- Data cards
- Status chips
- Bottom sheets
- Sticky CTAs
- Skeleton/loading states
- Timelines
- Progress steppers
- Empty states
- Trust banners
- Toasts

### Motion

Motion should be subtle and informative, particularly for price/portfolio transitions. The blueprint explicitly avoids casino-like reward animations.

---

# UX Rules That Should Apply Everywhere

1. The next financial action should be obvious within approximately three seconds.
2. Use one primary CTA per decision step wherever possible.
3. Never hide an important status behind a generic loading indicator.
4. Always explain why the user must provide a document or piece of information.
5. Distinguish indicative information from confirmed information.
6. Keep financial risk/disclosure information visible and understandable.
7. Do not use reward mechanics to obscure financial suitability or risk.
8. Make incomplete journeys resumable.
9. Give users a human support path on high-friction/high-stakes journeys.
10. Treat loading, empty, error, success, pending, locked and expired states as first-class screens/states.
11. Use reusable components instead of designing each product journey independently.
12. Maintain the same identity and design language across Buyer, Seller and Partner modes.

---

# Analytics Requirements

Every important user action and state transition should be measurable.

## Acquisition

- app_install
- signup_started
- otp_completed
- onboarding_completed
- referral_source
- partner_attribution
- campaign_attribution

## Discovery

- explore_opened
- category_selected
- product_viewed
- company_viewed
- search_used
- filter_used
- watchlist_added
- compare_started
- eligibility_started

## Transaction

- application_started
- kyc_started
- kyc_completed
- document_uploaded
- payment_started
- payment_completed
- order_submitted
- order_completed
- transfer_started
- settlement_completed

## Rewards

- welcome_reward_issued
- points_viewed
- eligible_transaction_completed
- benefit_unlocked
- gift_card_issued
- gift_card_redeemed
- lucky_draw_progress_updated
- lucky_draw_entry_created
- referral_created
- referral_converted
- reward_reversed

## Partner

- partner_signup
- partner_type_selected
- partner_profile_completed
- partner_kyc_completed
- partner_activated
- lead_created
- lead_qualified
- case_created
- case_converted
- payout_generated
- payout_paid
- opportunity_created

---

# Risk, Fraud, Compliance & Audit Considerations

The blueprint repeatedly implies that financial and reward actions must be auditable and rule-driven.

Required controls include:

- Immutable/auditable transaction records
- Reward event idempotency
- Campaign/rule versioning
- Reward reversal capability
- Payment idempotency
- Duplicate transaction protection
- Referral abuse detection
- Self-referral detection
- Device/account duplication checks
- Rapid cancellation/reversal monitoring
- Campaign/customer caps
- Manual review capability
- KYC expiry handling
- Document versioning
- Consent timestamps and audit trail
- Provider response logging
- Reconciliation between RFIN records and external providers
- Clear private-market disclosures around liquidity, transfer restrictions and valuation
- No implication of guaranteed returns or risk-free investment because of rewards

---

# MVP / Phase Roadmap

## MVP

The source blueprint identifies the following core MVP scope:

- Account
- Profile
- Explore
- Insurance
- Loans
- Unlisted/private markets
- Progressive KYC
- Application/order tracking
- Documents
- Support
- Basic rewards
- Referral

## Phase 2

- Customer 360
- Portfolio
- Personalization
- Cross-sell
- Advanced rewards
- Family profiles
- Deeper opportunity engine capabilities

## Phase 3

- RFIN AI engagement assistant
- Proactive alerts
- Next-best-action intelligence
- Goal tracking
- Intelligent support
- Advanced portfolio intelligence
- AI/private-market research assistance where approved

---

# Recommended Prototype Priority

The visual blueprint gives the following high-value prototype sequences.

## Partner / Operations

```text
HOME → SELL → ADD LEAD → CASE 360 → EARNINGS
```

## Customer transaction

```text
BUY → PRODUCT → CHECKOUT
```

## Referral

```text
REFER → TRACK
```

## Private markets

```text
HOME → COMPANY → BUY → CASE 360 → PORTFOLIO → PARTNER ADD LEAD → SELL
```

These flows should be prototyped as connected journeys, not as isolated screen mockups.

---

# Areas Where the Deck Does Not Fully Specify Implementation

The supplied blueprint provides a strong product/UI/UX definition but does not fully specify every technical/business implementation detail. These should become explicit decisions before final engineering estimation:

1. Exact authentication/session strategy and device security.
2. Exact KYC/identity verification providers.
3. KYC retry, expiry and exception policies.
4. Exact payment gateways and refund architecture.
5. Product-provider integration contracts for insurance and lending.
6. Exact private-market inventory source and settlement/transfer mechanism.
7. Demat/ownership verification implementation.
8. Private-market price-data freshness and provenance.
9. Gift-card/loaded-card provider and fulfilment APIs.
10. Lucky-draw legal/operational framework for each target jurisdiction/campaign.
11. Partner commission calculation and taxation rules.
12. Partner hierarchy/team-management rules, if required.
13. Detailed accounting/ledger architecture.
14. Data retention and deletion policies.
15. Exact RBAC matrix for customer, partner, operations, finance, compliance and admin users.
16. SLA definitions for every case/order state.
17. Exact notification provider and channel strategy.
18. External portfolio aggregation strategy.
19. Analytics platform and event taxonomy implementation.
20. Disaster recovery, backup, monitoring and operational incident processes.

These are not missing from the product concept; they are implementation decisions that need to be resolved before engineering scope can be considered final.

---

# Final Product Interpretation

The five source decks converge into a single product architecture:

```text
                         RFIN
                          |
        +-----------------+------------------+
        |                 |                  |
     CUSTOMER          PARTNER          PRIVATE MARKETS
        |                 |                  |
   Need / Goal        Leads / Cases      Discover / Research
        |                 |                  |
   Explore            Client 360          Buy / Sell
        |                 |                  |
  Eligibility       Opportunity Engine     Portfolio
        |                 |                  |
     KYC             Earnings / Payout      Insights
        |                 |                  |
 Transaction ---------+---------------------+
        |
   Track / Manage
        |
 Rewards / Referral / Benefits
        |
 Notifications / Support / Documents
        |
 Admin / Operations / Risk / Audit
```

The central architectural idea is **not five applications**. It is one platform with shared identity, shared customer/partner data, shared transaction infrastructure, shared opportunity intelligence, shared rewards, shared support and shared operational controls.

---

# Final Recommendation for Product & Engineering Handoff

Before development estimation or full engineering begins, convert this blueprint into the following formal deliverables:

1. **Product Requirements Document (PRD)** — business objectives, personas, journeys, acceptance criteria.
2. **Functional Requirements Document (FRD)** — module-by-module behaviour and business rules.
3. **Complete Screen Inventory** — every screen, modal, drawer, state and role.
4. **User Roles & Permissions Matrix** — Customer, Buyer, Seller, Referral Partner, Operations, Finance, Compliance, Admin and other internal roles.
5. **State Machine Specification** — all lifecycle states and transitions.
6. **API / Integration Matrix** — internal APIs and third-party dependencies.
7. **Data Model / ERD** — Customer 360, Partner 360, transactions, rewards, private markets and operations.
8. **Design System Specification** — tokens, typography, colours, components and interaction states.
9. **Analytics Event Dictionary** — event names, properties, source screens and business meaning.
10. **Compliance / Risk Requirements** — KYC, consent, disclosures, rewards, private-market risk and audit requirements.
11. **Operations Playbook** — KYC exceptions, order failures, fulfilment, reward reversals, reconciliation and escalations.
12. **Development WBS / Phase Plan** — frontend, backend, mobile, admin, integrations, QA, DevOps and release milestones.

This sequence prevents the engineering team from interpreting the presentation as a collection of individual screens. The source material is fundamentally a **system design and product operating model**, from which the screens should be generated.

---

# Source Coverage Note

This report consolidates the supplied merged 134-slide RFIN presentation covering the Customer Journey/UIUX Blueprint, Rewards/Gift Card/Lucky Draw Blueprint, Partner Registration Blueprint, Complete UI/UX Visual Blueprint and Unlisted Shares/Industry Blueprint.

The report intentionally preserves the source deck's major concepts such as **One ID, Customer 360, Partner 360, progressive KYC, Need → Match → Understand → Transact → Track → Manage → Earn → Grow, Rewards/Benefits/Lucky Draw, BUY/SELL/REFER/EARN, Client 360, Case 360, Opportunity Engine and private-market Discover → Understand → Transact → Manage**.

Where the deck describes a concept as a future phase, optional capability or configurable rule, this report does not treat it as a fixed implementation requirement.

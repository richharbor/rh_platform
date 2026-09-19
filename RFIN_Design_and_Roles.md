# RFIN — App Design & Roles

## 1. Product Design Direction

RFIN is designed as a **financial commerce + earning ecosystem**, rather than a conventional financial-products marketplace.

The core experience is:

**BUY → SELL → REFER → EARN**

A single RFIN account can operate in multiple roles simultaneously. The application should not create separate accounts or separate apps for each role. The interface adapts according to the role the user is currently using.

The design personality is:

- Premium fintech
- Modern
- Trustworthy
- Aspirational
- Simple
- Energetic

The overall experience should feel:

**Simple → Fast → Transparent → Rewarding**

The primary design principle is:

> **One user. Three roles. One RFIN ecosystem.**

Source: RFIN product brief, Product Vision and Architecture. fileciteturn0file0L6-L34

---

## 2. Core User Roles

RFIN has three primary user-facing roles.

### 2.1 Buyer

The Buyer uses RFIN to discover and access financial products and services.

Primary activities:

- Discover financial products
- Compare or review relevant options
- Submit enquiries/applications
- Complete required KYC and documentation
- Make payments where applicable
- Track applications and transactions
- Receive eligible RFIN benefits or rewards

Initial product areas include:

- Life Insurance
- Health Insurance
- Motor Insurance
- Personal Loans
- Home Loans
- Business Loans
- Mortgage
- Education Loans
- Vehicle Loans
- Working Capital
- Unlisted Shares
- Pre-IPO/private-market opportunities where applicable

The Buyer journey should use progressive disclosure and minimise unnecessary form filling.

Typical journey:

**Product discovery → Basic information → Requirement → Suitable options → Product details → KYC/documents → Payment/application → Confirmation → Eligible benefit/reward**

Source: Buyer Journey and initial product categories. fileciteturn0file0L36-L61 fileciteturn0file0L130-L140

---

### 2.2 Seller

The Seller uses RFIN to build and manage financial-product business.

Primary activities:

- Become an eligible Seller
- View available products
- Create leads
- Manage leads
- Track applications
- Monitor conversions
- Track commissions/business earnings
- Monitor pending and paid payouts

The Seller dashboard should focus on:

- This Month Earnings
- Pending Earnings
- Active Leads
- Conversions
- Create New Lead

Product shortcuts:

- Life
- Health
- Motor
- Loans
- Unlisted

The lead pipeline is:

**New → Contacted → Documents → Processing → Successful → Payout**

Seller earnings must be clearly separated from RFIN loyalty points and promotional benefits.

Every earning should provide:

- Transaction ID
- Product
- Status
- Amount
- Date
- Source
- Payout status

Source: Seller Mode and Seller Earnings. fileciteturn0file0L173-L200

---

### 2.3 Referral Partner

The Referral Partner uses RFIN to introduce people in their network to eligible RFIN products.

The referral experience should be extremely simple.

Primary activities:

- Select product category
- Create referral
- Share referral
- Track referral
- Track conversion
- Track eligible referral benefit
- Track payout where applicable

Sharing methods:

- WhatsApp
- Copy Link
- QR Code

Referral tracking should show:

- Referral
- Product
- Amount where relevant
- Status
- Potential/eligible referral benefit

Each referral should have an auditable referral record containing:

- Referral ID
- User ID
- Referrer
- Referred Person
- Product
- Timestamp
- Consent
- Lead Status
- Conversion Status
- Revenue
- Reward Eligibility
- Payout Status

Source: Referral Partner Mode and Referral Engine. fileciteturn0file0L221-L242

---

## 3. Multi-Role Experience

A major part of the app design is that the same person can be:

- Buyer
- Seller
- Referral Partner

at the same time.

The app should therefore provide a top-level:

**Buyer | Seller | Referral Partner**

role switcher.

Changing the selected role dynamically changes the relevant dashboard, actions, information and workflows without requiring another account.

The profile should retain information across the ecosystem, including:

- RFIN ID
- Roles
- Business Earnings
- RFIN Points
- KYC
- Bank Account
- Referrals
- Leads
- Transactions
- Documents
- Notifications
- Support
- Security
- Settings

Source: Role Switcher and Profile. fileciteturn0file0L291-L303

---

## 4. App Navigation

The main bottom navigation should be:

**Home | Explore | Earn | Rewards | Profile**

There should not be a separate bottom tab for every financial product.

### Home

The Home screen should emphasise earning and opportunity rather than looking like a traditional insurance or loan application.

Key areas:

- Personal greeting
- Earnings Card
- Primary BUY / SELL / REFER actions
- Rewards card
- Recommended Products
- Earn More section

Primary actions:

- **BUY** — Find financial solutions
- **SELL** — Build your business
- **REFER** — Earn from your network

Source: Home Screen and Bottom Navigation. fileciteturn0file0L71-L109

### Explore

Explore is the product and opportunity discovery area.

Sections:

- Insurance
- Loans
- Private Markets
- Become a Seller
- Refer & Earn

Source: Explore Screen. fileciteturn0file0L111-L128

### Earn

Earn brings together the three earning pathways:

- BUY — Get eligible benefits
- SELL — Earn from successful business
- REFER — Earn from successful referrals

It should show:

- Monthly earnings
- Lifetime earnings
- Next milestone/opportunity

Source: RFIN Earn Tab. fileciteturn0file0L275-L289

### Rewards

Rewards is separate from business earnings.

It can contain:

- RFIN Points
- Progress
- Tier information
- Configured benefits
- Lucky-draw information where applicable
- Campaigns

Potential tiers:

**Bronze → Silver → Gold → Platinum → Elite**

Source: RFIN Rewards and Lucky Draw. fileciteturn0file0L244-L273

### Profile

Profile acts as the user's account and operational centre.

It contains identity, role, KYC, financial, referral, transaction, document, support, security and settings information.

---

## 5. Financial Product Design

The initial product layer contains five broad product areas:

### Insurance

- Life
- Health
- Motor

### Loans

- Personal
- Home
- Business
- Mortgage
- Education
- Vehicle
- Working Capital
- Other eligible loan products

### Private Markets

- Unlisted Shares
- Pre-IPO/private-market opportunities where applicable

The architecture should be configurable so new financial products can be added without rebuilding the application.

Source: Initial Product Categories. fileciteturn0file0L36-L53

---

## 6. Earnings, Wallet and Rewards Design

RFIN should visually and structurally separate three concepts:

### Business Earnings

Actual commissions, payouts and referral income.

### RFIN Points

Loyalty/reward points.

### Promotional Benefits

Campaigns, lucky-draw entries, event eligibility and other approved promotional benefits.

These should be separately accounted for and displayed.

The wallet should use an auditable ledger rather than simply storing a balance.

Ledger states can include:

- Credit
- Debit
- Pending
- Released
- Reversed
- Expired
- Adjustment

Each financial entry should have:

- Transaction ID
- Timestamp
- Reason
- Actor

Business earnings and RFIN Points should use separate ledgers.

Source: Earnings separation and Ledger Architecture. fileciteturn0file0L203-L218 fileciteturn0file0L427-L437

---

## 7. Design System

The UI should use a reusable design system.

Core components:

- Buttons
- Cards
- Product Cards
- Earnings Cards
- Wallet Cards
- Reward Cards
- Progress Bars
- Status Chips
- Forms
- Bottom Sheets
- Modals
- Alerts
- Empty States
- Loading States
- Error States
- Success States

Recommended card radius:

**16–20px**

Typography recommendations:

- Inter
- SF Pro
- Manrope

Large typography should be used for:

- Earnings
- Points
- Progress
- Transaction values
- Milestones

Numbers should be visually dominant.

Source: Design Language, Typography and UI Component System. fileciteturn0file0L305-L359

---

## 8. Visual Language

### Colour Direction

- **Deep Navy / Midnight** — trust and financial credibility
- **Premium Green** — earnings and success
- **Warm Gold** — rewards, achievement and Elite
- **Off-white / light neutral** — background

### What to Avoid

- Traditional bank-style UI
- Excessive blue
- Dense forms
- Too many menus
- Generic stock imagery
- Overly complicated dashboards

### Micro-interactions

Use subtle, controlled animations for:

- Transaction success
- Referral conversion
- Points earned
- Tier upgrades

The experience should feel premium rather than like a gaming application.

Source: Design Language, Colour Direction and Micro-interactions. fileciteturn0file0L305-L369

---

## 9. Important App Screens

The initial design system should cover the following screens.

### Consumer/User Screens

1. Splash
2. Login / OTP
3. Onboarding
4. Role Selection
5. Home
6. Explore
7. Product Category
8. Product Detail
9. Buyer Application
10. Seller Dashboard
11. Add Lead
12. Lead Pipeline
13. Seller Earnings
14. Referral Dashboard
15. Create Referral
16. Referral Tracking
17. Rewards
18. Points Wallet
19. Tier / Leaderboard
20. Lucky Draw
21. Transactions
22. Documents
23. Profile
24. Notifications
25. Support

### Admin Screens

26. Admin Dashboard
27. Product Management
28. User Management
29. Lead Management
30. Payout Management
31. Reward Management
32. Analytics

Source: Final Design Direction. fileciteturn0file0L642-L652

---

## 10. Admin and Internal Roles

The product brief explicitly defines an Admin Console and a CEO/Management Dashboard, while the detailed permissions for individual internal job roles are not fully specified.

### Admin

The Admin Console covers:

- Users
- Products
- Leads
- Sellers
- Referrals
- Transactions
- Earnings
- Rewards
- Lucky Draw
- Events
- Notifications
- Support
- Risk/Fraud
- Reports

### Management / CEO

The management dashboard is intended to monitor:

- Total Users
- Active Sellers
- Active Referral Partners
- Active Buyers
- Transactions
- Transaction Value
- RFIN Revenue
- User Earnings
- Points Issued
- Pending Payout
- Top Products
- Top Sellers
- Top Referral Partners
- Conversion Rates
- Product-wise Revenue
- City-wise Performance

The source brief does not define a separate permission matrix for roles such as operations, finance, compliance, customer support or product management. Those roles would need to be defined during the detailed admin architecture phase.

Source: Admin Console and CEO/Management Dashboard. fileciteturn0file0L467-L484

---

## 11. Role Model Summary

| Role | Main Purpose | Primary Actions |
|---|---|---|
| Buyer | Access financial products | Discover, enquire/apply, complete KYC, transact, track |
| Seller | Build financial-product business | Create leads, manage pipeline, convert business, earn commissions |
| Referral Partner | Generate referrals | Create, share and track referrals, earn eligible benefits |
| Admin | Operate and control the platform | Manage users, products, leads, transactions, rewards, support, risk and reports |
| Management / CEO | Monitor business performance | Review platform, transaction, revenue, earnings and conversion metrics |

The first three are the core RFIN user roles. Admin and Management are internal platform roles.

---

## 12. Role Switching Principle

Role switching should be a first-class part of the product rather than a settings feature hidden deep inside the app.

Recommended interaction:

**Current Role**
→ Buyer / Seller / Referral Partner selector
→ Role-specific home/dashboard
→ Role-specific primary actions
→ Shared account, KYC, documents, notifications and transaction history

The user should never feel that they have entered a different application.

The goal is a unified ecosystem in which the user can move naturally between:

**BUY → SELL → REFER → EARN**

Source: Role Switcher and North Star. fileciteturn0file0L291-L296 fileciteturn0file0L616-L640

---

## 13. Design and Role Architecture Principle

RFIN should not be designed as five separate financial-product apps.

The product architecture should treat the initial financial products as a configurable product layer on top of a common platform.

The common platform contains:

- User and Role Management
- Product Catalogue
- Buyer Experience
- Seller Experience
- Lead Management
- Referral Engine
- Commission Engine
- Reward Engine
- Wallet / Ledger
- CRM
- Analytics
- Notifications
- Admin

This allows future products, partners, reward rules, referral models, campaigns and earning mechanisms to be added without redesigning the core platform.

Source: Final CTO direction. fileciteturn0file0L702-L713

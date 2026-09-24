export const stocks = [
  {
    id: 1,
    name: "National Stock Exchange Ltd",
    symbol: "NSE",
    exchange: "NSE",
    settlementPeriod: "24 Sep 2025",

    // Fundamentals (all values moved here)
    fundamentals: {
      currentPrice: "₹2,105",
      marketCap: "₹5,20,987.50 Cr",
      isin: "INE721I01024",
      faceValue: "₹1",
      peRatio: 42.75,
      eps: 49.24,
      pbRatio: 17.16,
      bookValue: 122.64,
      debtToEquity: 0,
    },

    analysis: {
      strengths: [
        "Market Leader: NSE’s market share in cash equities has gone from ~84% in FY14 to ~94% in 9MFY25. It is the largest derivatives exchange in the world by number of contracts traded, as on FY24.",
        "High Revenue Growth: NSE’s revenue grew at a 3-yr CAGR of ~38% and at a 10-yr CAGR of 27%.",
        "Scalable Fixed-Cost Model: Operating leverage allows profitability to grow faster than revenues, with EBITDA margins at ~80%.",
        "Investor-Centric Policies: High dividend payout ratio (~53% in FY24), reflecting commitment to shareholder returns.",
      ],
      weaknesses: [
        "Concentration of Revenue: NSE heavily relies on trading volume in specific segments like equity derivatives, exposing it to revenue fluctuations driven by market volatility.",
        "Regulatory Scrutiny: NSE operates under constant scrutiny from regulators like SEBI, making it more susceptible to compliance-related challenges.",
      ],
    },

    about:
      "The National Stock Exchange (NSE) is a leading stock exchange in India, established in 1992 and headquartered in Mumbai. It is the world's largest derivatives exchange by the number of contracts traded and the third largest in cash equities by the number of trades. NSE introduced electronic trading, making it the first exchange in India to do so, and it is known for its flagship index, the NIFTY 50.",

    boardOfDirectors: [
      { name: "Ashishkumar Chauhan", role: "Managing Director & CEO" },
      { name: "S Sudarshan", role: "Public Interest Director, Professor in IIT Bombay" },
      { name: "S Ravindran", role: "Public Interest Director, Former Executive Director at SEBI" },
      { name: "Tablesh Pandey", role: "Non-Independent Director, Managing Director of LIC" },
      { name: "Rajesh Gopinathan", role: "Public Interest Director, Professor in IIT Bombay, Former MD & CEO of TCS" },
      { name: "Abhilasha Kumari", role: "Public Interest Director, Retired Chief Justice of the Manipur High Court, Former Judicial Member, Lokpal of India" },
      { name: "Veneet Nayar", role: "Non-Independent Director, Founder Chairman of Sampark Foundation, Former Vice Chairman and CEO of HCL Technologies" },
      { name: "Mamata Biswal", role: "Public Interest Director, Professor of Law & ICSSR Senior Research Fellow, GNLU" },
    ],

    seniorManagement: [
      { name: "Ashishkumar Chauhan", role: "Managing Director & CEO" },
      { name: "Ian Desouza", role: "Chief Financial Officer" },
      { name: "Sriram Krishnan", role: "Chief Business Development Officer" },
      { name: "Somasundaram K S", role: "Chief Enterprise Risk Officer" },
      { name: "Shharad Dhakkate", role: "Chief Human Resources Office" },
      { name: "Piyush Chourasia", role: "Chief Regulatory Officer - Member Compliance, Surveillance, Member Inspection & Investigation" },
      { name: "Mayur Sindhwad", role: "Chief Technology Officer - Operations" },
      { name: "Viral Mody", role: "Chief Technology Officer - Applications & Development" },
      { name: "Ankit Sharma", role: "Chief Regulatory Officer - Listing and Investor Compliance" },
      { name: "Sampath Manickam", role: "Chief Technology Officer - Technology Infrastructure" },
      { name: "Rajesh Thapar", role: "Chief Information Security Officer" },
    ],
  },
  {
    id: 2,
    name: "Oravel Stays Ltd (OYO Rooms)",
    symbol: "OYO",
    exchange: "Unlisted",
    settlementPeriod: "7 Days",
    
    fundamentals: {
      currentPrice: "₹53",
      marketCap: "₹39,549.13 Cr",
      isin: "INE561T01021",
      faceValue: "₹1",
      peRatio: "151.43",
      eps: "0.35",
      pbRatio: "10.00",
      bookValue: "5.3",
      debtToEquity: "1.8",
    },

    analysis: {
      strengths: [
        "Credit Rating: Credit rating agency, Fitch, upgraded OYO’s rating to 'B' from 'B-' with a 'Stable' outlook.",
        "Repayment of Debt: Oyo has prepaid its debt up to ₹16.2 Bn Cr in Nov’23 which, further, brought down its gross debt to ₹37.2 Bn. They aim to be Net Debt-free by FY26.",
        "Improving Profitability: Oyo improved its EBITDA margins (as a % of GBV) from -44% in FY20 to ~+8% in FY24 with a net earning of ~₹100 Cr.",
        "Franchise model: The Company as on date operates on a totally franchise model with no fixed payout commitments and eliminating capex requirements, boosting profitability.",
        "Growing Outreach: In FY24, OYO added about 5,000 hotels and 6,000 homes globally."
      ],
      weaknesses: [
        "Delay in IPO: OYO filed two addendums to its prospectus, informing investors of its improved business performance in the first half of FY23. However, SEBI has requested additional information, delaying IPO.",
        "Subpar service quality: While OYO ensures affordability and reach, service quality is often inconsistent and controversial.",
        "Falling Valuation: Oyo's valuation dropped from ₹797.5 billion in Aug’21 to ₹287 bn in Jul’24."
      ],
    },

    about:
      "OYO Rooms, founded in 2012 by Ritesh Agarwal, is an Indian multinational hospitality chain that operates leased and franchised hotels, homes, and living spaces. OYO is focused primarily on budget hotels and ensures consistent quality and amenities across its properties through a standardised approach. It leverages a blend of technology and operational expertise to improve customer experience.",

    boardOfDirectors: [
      { name: "Ritesh Agarwal", role: "Founder, Chairman & Non-Executive Director" },
      { name: "Aditya Ghosh", role: "Non-Executive Director" },
      { name: "Bejul Somaia", role: "Non-Executive & Independent Director" },
      { name: "Dr. Deepa Malik", role: "Non-Executive & Independent Director" },
      { name: "Troy Alstead", role: "Non-Executive & Independent Director" },
      { name: "William Steve Albrecht", role: "Non-Executive & Independent Director" },
      { name: "Sumer Juneja", role: "Additional Non-Executive Director" },
    ],

    seniorManagement: [
      { name: "Abhinav Sinha", role: "Manager" },
      { name: "Rakesh Kumar", role: "Group Chief Financial Officer" },
      { name: "Rakesh Kumar Prusti", role: "Group General Counsel" },
    ],
  },
];
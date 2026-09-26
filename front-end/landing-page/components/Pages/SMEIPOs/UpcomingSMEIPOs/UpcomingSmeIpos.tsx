"use client";

const upcomingIpos = [
  {
    name: "Alpha Fintech Ltd",
    expectedDate: "Sep 25, 2025",
    industry: "Finance",
    priceBand: "To be announced",
    lotSize: "To be announced",
  },
  {
    name: "Green Energy Corp",
    expectedDate: "Oct 02, 2025",
    industry: "Renewable Energy",
    priceBand: "₹90 - ₹95 (Tentative)",
    lotSize: "1400 Shares (Tentative)",
  },
  {
    name: "NextGen Retail Pvt Ltd",
    expectedDate: "Oct 12, 2025",
    industry: "Retail",
    priceBand: "To be announced",
    lotSize: "To be announced",
  },
];

export default function UpcomingSmeIpos() {
  return (
    <section className="w-full text-foreground py-20 px-6 md:px-12 lg:px-20 rounded-2xl">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Upcoming SME IPOs
        </h2>
        <p className="text-lg text-muted-foreground">
          Explore the list of upcoming SME IPOs and plan your investments in
          advance.
        </p>
      </div>

      {/* IPO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingIpos.map((ipo, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-6 shadow-md hover:border-rich-violet hover:shadow-lg hover:shadow-rich-violet/30 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{ipo.name}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <span className="text-foreground">Expected Date:</span>{" "}
                {ipo.expectedDate}
              </li>
              <li>
                <span className="text-foreground">Industry:</span> {ipo.industry}
              </li>
              <li>
                <span className="text-foreground">Price Band:</span> {ipo.priceBand}
              </li>
              <li>
                <span className="text-foreground">Lot Size:</span> {ipo.lotSize}
              </li>
            </ul>

            {/* Notify Me Button */}
            <div className="mt-4">
              <button className="bg-primary px-4 py-2 rounded-lg text-foreground text-sm font-medium hover:bg-primary/90 transition">
                Notify Me
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

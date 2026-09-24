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
    <section className="w-full text-white py-20 px-6 md:px-12 lg:px-20 rounded-2xl">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Upcoming SME IPOs
        </h2>
        <p className="text-lg text-gray-400">
          Explore the list of upcoming SME IPOs and plan your investments in
          advance.
        </p>
      </div>

      {/* IPO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingIpos.map((ipo, i) => (
          <div
            key={i}
            className="bg-card border border-gray-800 rounded-xl p-6 shadow-md hover:border-rich-violet hover:shadow-lg hover:shadow-rich-violet/30 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{ipo.name}</h3>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>
                <span className="text-white">Expected Date:</span>{" "}
                {ipo.expectedDate}
              </li>
              <li>
                <span className="text-white">Industry:</span> {ipo.industry}
              </li>
              <li>
                <span className="text-white">Price Band:</span> {ipo.priceBand}
              </li>
              <li>
                <span className="text-white">Lot Size:</span> {ipo.lotSize}
              </li>
            </ul>

            {/* Notify Me Button */}
            <div className="mt-4">
              <button className="bg-gradient-to-r from-rich-violet to-[#704bd2] px-4 py-2 rounded-lg text-white text-sm font-medium hover:from-rich-violet/60 hover:to-[#704bd2]/60 transition">
                Notify Me
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

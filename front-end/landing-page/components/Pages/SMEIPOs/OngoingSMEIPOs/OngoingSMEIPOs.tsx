"use client";

const ipoList = [
  {
    name: "ABC Industries Ltd",
    issueDate: "Sep 10 - Sep 13, 2025",
    priceBand: "₹100 - ₹105",
    lotSize: "1200 Shares",
    status: "Open",
  },
  {
    name: "XYZ Technologies Ltd",
    issueDate: "Sep 15 - Sep 18, 2025",
    priceBand: "₹75 - ₹80",
    lotSize: "1600 Shares",
    status: "Upcoming",
  },
  {
    name: "LMN Healthcare Ltd",
    issueDate: "Sep 01 - Sep 04, 2025",
    priceBand: "₹55 - ₹60",
    lotSize: "1000 Shares",
    status: "Closed",
  },
];

export default function OngoingSmeIpos() {
  return (
    <section className="w-full text-foreground py-20 px-6 md:px-12 lg:px-20 rounded-2xl">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ongoing SME IPOs
        </h2>
        <p className="text-lg text-muted-foreground">
          Stay updated with the latest SME IPOs currently open for subscription.
        </p>
      </div>

      {/* IPO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ipoList.map((ipo, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-6 shadow-md hover:border-rich-violet hover:shadow-lg hover:shadow-rich-violet/30 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{ipo.name}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <span className="text-foreground">Issue Date:</span> {ipo.issueDate}
              </li>
              <li>
                <span className="text-foreground">Price Band:</span> {ipo.priceBand}
              </li>
              <li>
                <span className="text-foreground">Lot Size:</span> {ipo.lotSize}
              </li>
              <li>
                <span className="text-foreground">Status:</span>{" "}
                <span
                  className={`${
                    ipo.status === "Open"
                      ? "text-rh-emerald"
                      : ipo.status === "Upcoming"
                      ? "text-rh-gold"
                      : "text-red-400"
                  } font-medium`}
                >
                  {ipo.status}
                </span>
              </li>
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <button className="z-10 bg-primary px-6 py-3 rounded-xl text-foreground font-medium hover:bg-primary/90 transition ease-in-out duration-200">
          View All SME IPOs
        </button>
      </div>
    </section>
  );
}

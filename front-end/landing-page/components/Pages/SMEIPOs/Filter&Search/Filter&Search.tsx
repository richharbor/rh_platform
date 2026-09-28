"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type IPO = {
  id: number;
  name: string;
  industry: string;
  status: "ongoing" | "upcoming" | "closed";
  price: number;
};

const dummyIPOs: IPO[] = [
  { id: 1, name: "ABC Technologies SME IPO", industry: "it", status: "ongoing", price: 120 },
  { id: 2, name: "Green Energy Limited", industry: "manufacturing", status: "upcoming", price: 80 },
  { id: 3, name: "FreshFoods Agro SME IPO", industry: "retail", status: "closed", price: 60 },
  { id: 4, name: "FinServe Capital SME IPO", industry: "finance", status: "ongoing", price: 95 },
  { id: 5, name: "MediCare Pharma SME IPO", industry: "it", status: "upcoming", price: 70 },
];

export default function SmeIpoFilters() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);

  // Filter IPOs
  const filteredIPOs = dummyIPOs.filter((ipo) => {
    const matchesSearch = ipo.name.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industry === "all" || ipo.industry === industry;
    const matchesStatus = status === "all" || ipo.status === status;
    const matchesPrice = ipo.price >= priceRange[0] && ipo.price <= priceRange[1];
    return matchesSearch && matchesIndustry && matchesStatus && matchesPrice;
  });

  return (
    <section id="filter-search" className="max-w-7xl mx-auto w-full text-white py-12 px-6 md:px-12 lg:px-20 rounded-2xl mt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-batman md:text-3xl font-bold mb-2">
            Filter & Search SME IPOs
          </h2>
          <p className="text-gray-400 text-lg">
            Refine your search and explore IPOs that fit your investment strategy.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Search */}
          <div>
            <label className="block text-sm mb-2 text-gray-400">Search by Name</label>
            <Input
              placeholder="Enter company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border-gray-800 text-white"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm mb-2 text-gray-400">Industry</label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-full bg-card border-gray-800 text-white">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm mb-2 text-gray-400">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full bg-card border-gray-800 text-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm mb-2 text-gray-400">Price Range</label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={500}
              step={10}
              className="text-rich-violet"
            />
            <p className="text-gray-400 text-sm mt-2">
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </p>
          </div>
        </div>

        {/* IPO Results */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredIPOs.length > 0 ? (
            filteredIPOs.map((ipo) => (
              <div
                key={ipo.id}
                className="p-5 bg-card border border-gray-800 rounded-xl shadow hover:border-rich-violet transition"
              >
                <h3 className="text-lg font-semibold">{ipo.name}</h3>
                <p className="text-sm text-gray-400">Industry: {ipo.industry}</p>
                <p className="text-sm text-gray-400">Price: ₹{ipo.price}</p>
                <span
                  className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
                    ipo.status === "ongoing"
                      ? "bg-green-200/20 text-green-400"
                      : ipo.status === "upcoming"
                      ? "bg-yellow-200/20 text-yellow-400"
                      : "bg-red-200/20 text-red-400"
                  }`}
                >
                  {ipo.status.toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-full">No IPOs found</p>
          )}
        </div>
      </div>
    </section>
  );
}

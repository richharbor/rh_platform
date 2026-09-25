// Indicative eligibility — RFIN's estimate, never a provider decision (report #27).
function checkEligibility(product, monthlyIncome, amount) {
  const rupees = Number(monthlyIncome) || 0;
  if (product.category === "loans") {
    const max = Math.round(rupees * (product.id === "lap" ? 60 : 20)) * 100;
    const ok = rupees >= 25_000 && (!amount || amount <= max);
    return {
      productId: product.id,
      kind: "indicative",
      eligible: ok,
      // Below the lender minimum there is no meaningful "up to" figure.
      maxAmount: rupees >= 25_000 ? max : undefined,
      rate: ok ? (rupees >= 1_00_000 ? "10.5% – 12% p.a." : "13% – 16% p.a.") : undefined,
      reasons: ok
        ? ["Income supports the amount you asked for", "Final rate depends on your credit score and the lender's checks"]
        : rupees < 25_000
          ? ["Minimum monthly income for this lender is ₹25,000"]
          : [`Your income supports up to ₹${(max / 100).toLocaleString("en-IN")}. Try a smaller amount.`],
    };
  }
  const ok = rupees >= 15_000;
  return {
    productId: product.id,
    kind: "indicative",
    eligible: ok,
    reasons: ok ? ["You meet the provider's basic income criteria", "Cover is confirmed only after underwriting"] : ["This plan needs a monthly income of at least ₹15,000"],
  };
}

module.exports = { checkEligibility };

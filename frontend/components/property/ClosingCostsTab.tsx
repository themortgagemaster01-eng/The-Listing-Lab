import { FileCheck, Landmark, Percent, Receipt, Scale, Search } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { MetricCard } from "@/components/shared/MetricCard";
import type { Property } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface ClosingCostsTabProps {
  property: Property;
}

export function ClosingCostsTab({ property }: ClosingCostsTabProps) {
  const price = property.price ?? 500000;

  const lineItems = [
    { label: "Title Insurance", icon: Scale, value: price * 0.0045 },
    { label: "NY State Transfer Tax", icon: Landmark, value: price * 0.004 },
    { label: "Attorney Fees", icon: FileCheck, value: 1500 },
    { label: "Municipal & Tax Search", icon: Search, value: 400 },
    { label: "Recording Fees", icon: Receipt, value: 250 },
    { label: "Loan Origination Fee (est.)", icon: Percent, value: price * 0.005 },
  ];

  const total = lineItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <DashboardCard title="Estimated Closing Costs" action={{ label: `Based on ${currency.format(price)} price` }}>
        <div className="space-y-2.5">
          {lineItems.map((item) => (
            <MetricCard key={item.label} label={item.label} value={currency.format(item.value)} icon={item.icon} />
          ))}
          <MetricCard label="Total Estimated Closing Costs" value={currency.format(total)} icon={Receipt} emphasis />
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          These are rough estimates for illustrative purposes only and will vary by lender, title
          company, and municipality. Actual closing costs will be provided in your Loan Estimate.
        </p>
      </DashboardCard>
    </div>
  );
}

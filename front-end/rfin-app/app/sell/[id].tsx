import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/api/client";
import { useListing } from "@/api/hooks";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { LISTING, LISTING_STEPS } from "@/features/markets";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, Display, QueryView, Row, Screen, Section, StatusChip, Stepper, SupportPanel, Text, Timeline } from "@/ui";

/** Listing status: Match → Approvals → Transfer → Paid (report #93). */
export default function ListingStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const listing = useListing(id);
  const cancel = useMutation({
    mutationFn: () => api("listings.cancel", { id }),
    onSuccess: (l) => {
      qc.setQueryData(["listing", id], l);
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  return (
    <Screen header={<PageHeader label={id} />}>
      <QueryView query={listing}>
        {(l) => {
          const idx = Math.max(0, LISTING_STEPS.indexOf(l.state));
          return (
            <>
              <StatusChip label={LISTING[l.state].label} tone={LISTING[l.state].tone} />
              <Display size={40}>{l.state === "paid" ? "Sold." : l.state === "cancelled" ? "Listing cancelled." : `${l.quantity} ${l.companyName} shares.`}</Display>
              {l.state !== "cancelled" ? <Stepper steps={["Verify", "Listed", "Matched", "Approvals", "Transfer", "Paid"]} current={idx} /> : null}
              <Card style={{ gap: 4 }}>
                <Text variant="label">{l.state === "paid" ? "Paid to your bank" : "Asking"}</Text>
                <AmountText size={32}>{l.state === "paid" && l.proceeds ? formatINR(l.proceeds) : `${formatINR(l.ask)} / share`}</AmountText>
                {l.buyerInterest ? <Text variant="caption">{l.buyerInterest} interested buyers</Text> : null}
              </Card>
              <Section title="Timeline">
                <Timeline steps={l.timeline} />
              </Section>
              {["verifying", "listed"].includes(l.state) ? (
                <Row>
                  <Button label="Cancel listing" variant="outline" loading={cancel.isPending} onPress={() => cancel.mutate()} />
                </Row>
              ) : null}
              {cancel.isError ? <Text variant="xs" style={{ color: colors.red }}>{cancel.error.message}</Text> : null}
              <SupportPanel body={`Questions about ${l.id}? An advisor can see where it is in the transfer.`} onPress={() => router.push({ pathname: "/support", params: { contextType: "listing", contextId: l.id, subject: `About listing ${l.id}` } })} />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}

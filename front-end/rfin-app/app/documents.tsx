import { useRouter } from "expo-router";
import { FileText } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useDocuments } from "@/api/hooks";
import type { DocumentItem } from "@/domain/models";
import type { Tone } from "@/domain/states";
import { useTheme } from "@/design";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { BottomSheet, Button, Chips, QueryView, Row, Screen, StatusChip, Text, useToast } from "@/ui";

const KIND: Record<DocumentItem["kind"], string> = { policy: "Policies", receipt: "Receipts", sanction: "Loan letters", statement: "Statements", kyc: "KYC" };
const STATE: Record<DocumentItem["state"], { label: string; tone: Tone }> = {
  available: { label: "Available", tone: "success" },
  in_review: { label: "In review", tone: "pending" },
  requested: { label: "Needed", tone: "action" },
  expired: { label: "Expired", tone: "neutral" },
};

/** Documents centre — every policy, receipt, statement and KYC record (report #46). */
export default function Documents() {
  const router = useRouter();
  const toast = useToast();
  const { colors } = useTheme();
  const docs = useDocuments();
  const [kind, setKind] = useState<"all" | DocumentItem["kind"]>("all");
  const [open, setOpen] = useState<DocumentItem | null>(null);
  const kinds = [...new Set((docs.data ?? []).map((d) => d.kind))];

  return (
    <Screen header={<PageHeader label="Documents" />} eyebrow="Documents" title="Every record, one place." subtitle="Policies, receipts and KYC appear here the moment they're issued.">
      <Chips value={kind} onChange={setKind} items={[{ id: "all" as const, label: "All" }, ...kinds.map((k) => ({ id: k, label: KIND[k] }))]} />
      <QueryView query={docs} empty={{ title: "No documents yet", body: "Complete an application and its documents land here." }}>
        {(list) => (
          <View>
            {list
              .filter((d) => kind === "all" || d.kind === kind)
              .map((d) => (
                <Pressable key={d.id} onPress={() => setOpen(d)} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent" })}>
                  <View style={{ width: 36, height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}>
                    <FileText size={16} color={colors.foreground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{d.title}</Text>
                    <Text variant="xs">{KIND[d.kind]} · {ago(d.at)}{d.orderId ? ` · ${d.orderId}` : ""}</Text>
                  </View>
                  <StatusChip label={STATE[d.state].label} tone={STATE[d.state].tone} />
                </Pressable>
              ))}
          </View>
        )}
      </QueryView>

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open?.title}>
        {open ? (
          <View style={{ gap: 12 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text variant="label">{KIND[open.kind]}</Text>
              <StatusChip label={STATE[open.state].label} tone={STATE[open.state].tone} />
            </Row>
            {open.fileName ? <Text variant="code">{open.fileName}</Text> : null}
            {open.state === "available" ? (
              <Button label="Download" block onPress={() => toast("Downloads arrive with file storage (S3)", "info")} />
            ) : open.state === "requested" && open.kycItem ? (
              <Button label="Upload now" block variant="red" onPress={() => { setOpen(null); router.push({ pathname: "/kyc/upload/[item]", params: { item: open.kycItem! } }); }} />
            ) : (
              <Text variant="muted">We'll let you know when the review finishes.</Text>
            )}
            {open.orderId ? <Button label={`View ${open.orderId}`} variant="outline" block onPress={() => { setOpen(null); router.push(`/order/${open.orderId}`); }} /> : null}
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

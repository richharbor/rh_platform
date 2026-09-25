import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { api } from "@/api/client";
import { useBanks } from "@/api/hooks";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Button, Card, FormField, QueryView, Row, Screen, Section, StatusChip, StickyCTA, Text, TrustBanner } from "@/ui";

const TONE = { verifying: "pending", verified: "success", failed: "danger" } as const;
const LABEL = { verifying: "Verifying", verified: "Verified", failed: "Failed" } as const;

/** Bank details with a visible verification state (report #36). */
export default function Bank() {
  const qc = useQueryClient();
  const { colors } = useTheme();
  const banks = useBanks();
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [adding, setAdding] = useState(false);

  const add = useMutation({
    mutationFn: () => api("bank.add", { holder: holder.trim(), account, ifsc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] });
      qc.invalidateQueries({ queryKey: ["kyc"] });
      setAdding(false);
      setAccount("");
      setConfirm("");
      setIfsc("");
    },
  });

  // A penny-drop finishing also completes the bank KYC item.
  const verifyingCount = banks.data?.filter((b) => b.state === "verifying").length ?? 0;
  const prevVerifying = useRef(verifyingCount);
  useEffect(() => {
    if (verifyingCount < prevVerifying.current) qc.invalidateQueries({ queryKey: ["kyc"] });
    prevVerifying.current = verifyingCount;
  }, [verifyingCount, qc]);

  const mismatch = confirm.length > 0 && confirm !== account;
  const valid = holder.trim().length > 2 && account.length >= 9 && confirm === account && ifsc.length === 11;
  const hasAny = (banks.data?.length ?? 0) > 0;
  const showForm = adding || (banks.isSuccess && !hasAny);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader label="Bank accounts" />}
        eyebrow="Bank"
        title="Where your money lands."
        subtitle="Payouts, refunds and loan disbursals go here. We verify it by sending ₹1."
        footer={
          showForm ? (
            <StickyCTA note="We'll deposit ₹1 to confirm the name matches. It's yours to keep.">
              <Button label="Verify account" block disabled={!valid} loading={add.isPending} onPress={() => add.mutate()} />
            </StickyCTA>
          ) : undefined
        }
      >
        <QueryView query={banks}>
          {(list) =>
            list.length ? (
              <Section title="Your accounts">
                {list.map((b) => (
                  <Card key={b.id} style={{ gap: 6 }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="title">{b.bank}</Text>
                      <StatusChip label={LABEL[b.state]} tone={TONE[b.state]} />
                    </Row>
                    <Text variant="code">•••• {b.last4} · {b.ifsc}{b.primary ? " · PRIMARY" : ""}</Text>
                    {b.failureReason ? <Text variant="xs" style={{ color: colors.red }}>{b.failureReason}</Text> : null}
                    {b.state === "verifying" ? <Text variant="xs">Usually under a minute.</Text> : null}
                  </Card>
                ))}
                {!adding ? <Button label="Add another account" variant="outline" onPress={() => setAdding(true)} /> : null}
              </Section>
            ) : null
          }
        </QueryView>

        {showForm ? (
          <View style={{ gap: 16 }}>
            <FormField label="Account holder name" value={holder} onChangeText={setHolder} autoComplete="name" placeholder="As printed on your passbook" why="Must match your PAN name for payouts to succeed." />
            <FormField label="Account number" value={account} onChangeText={(t) => setAccount(t.replace(/\D/g, "").slice(0, 18))} keyboardType="number-pad" secureTextEntry placeholder="••••••••••" />
            <FormField label="Confirm account number" value={confirm} onChangeText={(t) => setConfirm(t.replace(/\D/g, "").slice(0, 18))} keyboardType="number-pad" placeholder="Type it again" error={mismatch ? "The numbers don't match" : undefined} />
            <FormField label="IFSC" value={ifsc} onChangeText={(t) => setIfsc(t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))} autoCapitalize="characters" placeholder="HDFC0001234" why="11 characters, printed on your cheque book." error={add.error?.message} />
            <Text variant="xs">Mock: account numbers ending 0000 fail verification.</Text>
          </View>
        ) : null}

        <TrustBanner>RFIN never debits this account. It's used only to send money to you.</TrustBanner>
      </Screen>
    </KeyboardAvoidingView>
  );
}

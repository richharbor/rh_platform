import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Switch } from "react-native";
import { api, API_URL } from "@/api/client";
import { useTheme, type ThemePref } from "@/design";
import { Button, Card, Row, Screen, Section, Text } from "@/ui";

const TOGGLES: { key: "failPayments"; label: string }[] = [{ key: "failPayments", label: "Payments fail (server-side)" }];

export default function DevScenarios() {
  const qc = useQueryClient();
  const { pref, setPref } = useTheme();
  const [s, setS] = useState({ failPayments: false });

  const flip = (key: (typeof TOGGLES)[number]["key"], v: boolean) => {
    api("dev.scenario", { [key]: v })
      .then(setS)
      .then(() => qc.invalidateQueries())
      .catch(() => {});
  };

  return (
    <Screen title="Mock scenarios" subtitle={`Force failure paths on rhserver (${API_URL}) so every state screen can be reached.`}>
      <Section title="Server behaviour">
        <Card style={{ gap: 14 }}>
          {TOGGLES.map((t) => (
            <Row key={t.key} style={{ justifyContent: "space-between" }}>
              <Text>{t.label}</Text>
              <Switch value={s[t.key]} onValueChange={(v) => flip(t.key, v)} />
            </Row>
          ))}
        </Card>
      </Section>
      <Section title="Theme">
        <Row>
          {(["system", "light", "dark"] as ThemePref[]).map((p) => (
            <Button key={p} label={p} variant={pref === p ? "ink" : "outline"} onPress={() => setPref(p)} />
          ))}
        </Row>
      </Section>
    </Screen>
  );
}

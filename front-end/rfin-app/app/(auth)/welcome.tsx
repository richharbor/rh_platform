import { useRouter } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";
import { useTheme } from "@/design";
import { Button, Display, GoalTile, Rise, Row, Screen, Section, StickyCTA, Text, TrustBanner } from "@/ui";

/** Entry: say what RFIN does before asking for anything (report #11). */
export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const start = () => router.push("/phone");

  return (
    <Screen
      footer={
        <StickyCTA note="Already with RFIN? Use the same number to sign in.">
          <Button label="Get started" block event="signup_started" onPress={start} trailingIcon={<ArrowUpRight size={16} color={colors.onInverse} />} />
        </StickyCTA>
      }
    >
      <Rise>
        <Display size={56} dot>RFIN</Display>
      </Rise>
      <Rise delay={1}>
        <Text variant="eyebrow">One ID · One home</Text>
        <Text variant="hero" style={{ marginTop: 8 }}>Your financial life, in one place.</Text>
        <Text variant="muted" style={{ marginTop: 16 }}>
          Invest, protect your family, borrow, sell private shares or refer someone — with every application and reward tracked in one place.
        </Text>
      </Rise>
      <Rise delay={2}>
        <Section title="What you can do">
          <View style={{ gap: 12 }}>
            <Row gap={12}>
              <GoalTile label="Invest" index={1} accent="red" onPress={start} />
              <GoalTile label="Protect" index={2} accent="blue" onPress={start} />
            </Row>
            <Row gap={12}>
              <GoalTile label="Borrow" index={3} accent="amber" onPress={start} />
              <GoalTile label="Sell" index={4} accent="green" onPress={start} />
            </Row>
          </View>
        </Section>
      </Rise>
      <Rise delay={3}>
        <TrustBanner>Look around first. We only ask for KYC when a transaction needs it.</TrustBanner>
      </Rise>
    </Screen>
  );
}

import { Check, X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { TimelineStep } from "@/domain/models";
import type { Tone } from "@/domain/states";
import { radius, useTheme, useThemedStyles, type Theme } from "@/design";
import { Row, Text } from "./primitives";
import { toneColors } from "./tone";

/** `font-mono text-[11px] text-rfin-green` — status as an uppercase code, no pill. */
export function StatusChip({ label, tone, size = 11 }: { label: string; tone: Tone; size?: number }) {
  const th = useTheme();
  return <Text variant="code" style={{ color: toneColors(th, tone).text, fontSize: size, textTransform: "uppercase" }}>{label}</Text>;
}

/** Soft pill variant for places a code alone is too quiet (e.g. on a busy card). */
export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const th = useTheme();
  const c = toneColors(th, tone);
  return (
    <View style={{ backgroundColor: c.soft, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
      <Text variant="code" style={{ color: c.text, textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}

/** `h-1.5 overflow-hidden rounded-full bg-rfin-ink/10` with a solid fill. */
export function ProgressBar({ value, tone = "success", height = 6 }: { value: number; tone?: Tone; height?: number }) {
  const th = useTheme();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: th.colors.track, overflow: "hidden" }}>
      <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: toneColors(th, tone).solid }} />
    </View>
  );
}

/** `ApplicationRow` / `StatusCard` from the reference: title, status code, progress. */
export function StatusRow({ title, status, tone, progress, boxed }: { title: string; status: string; tone: Tone; progress: number; boxed?: boolean }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={boxed ? s.statusCard : s.statusRow}>
      <Row style={{ justifyContent: "space-between" }} gap={16}>
        <Text variant="title" style={{ flexShrink: 1 }}>{title}</Text>
        <StatusChip label={status} tone={tone} size={boxed ? 10 : 11} />
      </Row>
      <View style={{ marginTop: 12 }}>
        <ProgressBar value={progress} tone={tone} />
      </View>
    </View>
  );
}

/** Segmented progress for multi-step flows (KYC, checkout, partner onboarding). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={{ gap: 8 }}>
      <View style={s.stepTrack}>
        {steps.map((_, i) => (
          <View key={i} style={[s.stepBar, i < current && s.stepDone, i === current && s.stepOn]} />
        ))}
      </View>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="label">{steps[current]}</Text>
        <Text variant="code">{String(current + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</Text>
      </Row>
    </View>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const ACTOR = { you: "You", rfin: "RFIN", provider: "Provider" } as const;

/** `ActivityRow` circles joined into a timeline (report #38). */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View>
      {steps.map((step, i) => (
        <View key={i} style={s.tlRow}>
          <View style={{ alignItems: "center" }}>
            <View style={[s.tlDot, step.failed ? s.tlDotFailed : step.done ? s.tlDotDone : s.tlDotTodo]}>
              {step.failed ? <X size={14} color={colors.red} /> : step.done ? <Check size={14} color={colors.green} /> : <View style={s.tlPip} />}
            </View>
            {i < steps.length - 1 ? <View style={s.tlLine} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 18, paddingTop: 6 }}>
            <Text variant="title">{step.label}</Text>
            <Text variant="xs" style={{ marginTop: 2 }}>
              {step.done ? `${ACTOR[step.actor]} · ${shortDate(step.at)}` : `Waiting on ${ACTOR[step.actor]}`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** 0/3 → 3/3 lucky-draw progress, amber ring and an Anton count. Calm, not a slot machine. */
export function ProgressRing({ value, total, size = 72, label }: { value: number; total: number; size?: number; label?: string }) {
  const { colors, figure } = useTheme();
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / total);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={pct >= 1 ? colors.green : colors.amber}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={figure(size / 3.4)}>
        {label ?? `${value}/${total}`}
      </Text>
    </View>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    statusRow: { borderBottomWidth: 1, borderBottomColor: th.colors.lineSoft, paddingBottom: 16 },
    statusCard: { ...th.surface, padding: 16 },
    stepTrack: { flexDirection: "row", gap: 4 },
    stepBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: th.colors.track },
    stepDone: { backgroundColor: th.colors.green },
    stepOn: { backgroundColor: th.colors.foreground },
    tlRow: { flexDirection: "row", gap: 12 },
    tlDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    tlDotDone: { backgroundColor: th.colors.greenSoft },
    tlDotFailed: { backgroundColor: th.colors.redSoft },
    tlDotTodo: { borderWidth: 1, borderColor: th.colors.line },
    tlPip: { width: 6, height: 6, borderRadius: 3, backgroundColor: th.colors.mute },
    tlLine: { width: 1, flex: 1, minHeight: 8, backgroundColor: th.colors.line },
  });

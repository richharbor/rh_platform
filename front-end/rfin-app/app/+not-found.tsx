import { useRouter } from "expo-router";
import { Button, EmptyState, Screen } from "@/ui";

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <EmptyState title="Page not found" body="This screen doesn't exist or has moved." />
      <Button label="Go home" block onPress={() => router.replace("/")} />
    </Screen>
  );
}

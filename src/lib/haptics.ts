import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

async function safe(run: () => Promise<void>) {
  try {
    await run();
  } catch {
    // Haptics no disponibles (sim / web / settings).
  }
}

export function hapticSelection() {
  return safe(() => Haptics.selectionAsync());
}

export function hapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  return safe(() => Haptics.impactAsync(style));
}

export function hapticSuccess() {
  return safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function hapticWarning() {
  return safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}

export { Haptics, Platform };

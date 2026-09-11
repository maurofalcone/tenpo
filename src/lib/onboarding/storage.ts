import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_DONE_KEY = "@tenpo/onboarding-done";

export async function loadOnboardingDone(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export async function saveOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, "1");
}

export async function clearOnboardingDone(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_DONE_KEY);
}

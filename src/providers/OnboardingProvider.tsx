import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearOnboardingDone,
  loadOnboardingDone,
  saveOnboardingDone,
} from "@/lib/onboarding/storage";

type OnboardingContextValue = {
  isHydrating: boolean;
  isDone: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOnboardingDone().then((done) => {
      if (!cancelled) {
        setIsDone(done);
        setIsHydrating(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const complete = useCallback(async () => {
    await saveOnboardingDone();
    setIsDone(true);
  }, []);

  const reset = useCallback(async () => {
    await clearOnboardingDone();
    setIsDone(false);
  }, []);

  const value = useMemo(
    () => ({ isHydrating, isDone, complete, reset }),
    [complete, isDone, isHydrating, reset],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return value;
}

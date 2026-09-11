import type { ReactElement } from "react";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

export async function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): Promise<RenderResult> {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react-native";

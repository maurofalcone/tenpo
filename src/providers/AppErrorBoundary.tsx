import { ErrorBoundary } from "react-error-boundary";
import { View } from "react-native";
import { ErrorView, Screen } from "@/ui";

function CrashFallback({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) {
  return (
    <Screen>
      <View className="flex-1">
        <ErrorView
          title="Algo se rompió"
          description="La app tuvo un error inesperado. Podés intentar recuperarla."
          actionTitle="Reintentar"
          onAction={resetErrorBoundary}
        />
      </View>
    </Screen>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={CrashFallback}>{children}</ErrorBoundary>
  );
}

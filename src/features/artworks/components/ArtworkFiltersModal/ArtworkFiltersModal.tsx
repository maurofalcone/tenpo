import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text as RNText,
  View,
} from "react-native";
import { Button, Icon, Input, Modal, Text } from "@/ui";
import { useTheme } from "@/providers/ThemeProvider";
import { ClassificationPickerList } from "../ClassificationPickerList";
import {
  areFiltersEqual,
  emptyFilters,
  normalizeFilters,
} from "@/lib/artwork";
import {
  loadFilterHistory,
  pushFilterHistory,
  type FilterHistoryEntry,
} from "@/lib/artwork";
import type {
  ArtworkFiltersModalProps,
  Step,
} from "./ArtworkFiltersModal.types";
import {
  CLASSIFICATION_LIST_HEIGHT,
  FIELD_FONT_SIZE,
  STEP_SLIDE_MS,
} from "./ArtworkFiltersModal.utils";

export type {
  ArtworkFiltersModalProps,
  Step,
} from "./ArtworkFiltersModal.types";

function keyboardBodyHeight() {
  const screenH = Dimensions.get("window").height;
  // Con teclado: dejar título + acciones visibles y scrollear el resto.
  return Math.max(180, Math.round(screenH * 0.36));
}

export function ArtworkFiltersModal({
  visible,
  initialFilters,
  onClose,
  onApply,
}: ArtworkFiltersModalProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(initialFilters);
  const [step, setStep] = useState<Step>("filters");
  const [history, setHistory] = useState<FilterHistoryEntry[]>([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [paneWidth, setPaneWidth] = useState(
    Dimensions.get("window").width - 40,
  );
  const stepAnim = useRef(new Animated.Value(0)).current;
  const animatingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setDraft(initialFilters);
      setStep("filters");
      stepAnim.setValue(0);
      loadFilterHistory().then(setHistory);
    } else {
      Keyboard.dismiss();
      setStep("filters");
      setKeyboardOpen(false);
      stepAnim.setValue(0);
    }
  }, [visible, initialFilters, stepAnim]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardOpen(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const bodyHeight =
    keyboardOpen && Platform.OS === "ios"
      ? keyboardBodyHeight()
      : CLASSIFICATION_LIST_HEIGHT;

  const animateToStep = (next: Step) => {
    if (animatingRef.current || next === step) {
      return;
    }
    animatingRef.current = true;
    Keyboard.dismiss();
    setStep(next);
    Animated.timing(stepAnim, {
      toValue: next === "classification" ? 1 : 0,
      duration: STEP_SLIDE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        animatingRef.current = false;
      }
    });
  };

  const handleSheetClose = () => {
    if (step === "classification") {
      animateToStep("filters");
      return;
    }
    onClose();
  };

  const applyFilters = () => {
    Keyboard.dismiss();
    const next = normalizeFilters(draft);
    if (!areFiltersEqual(initialFilters, next)) {
      onApply(next);
    }
    pushFilterHistory(next).then(setHistory);
    onClose();
  };

  const clearFilters = () => {
    Keyboard.dismiss();
    const next = emptyFilters();
    if (!areFiltersEqual(initialFilters, next)) {
      onApply(next);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title={step === "filters" ? "Filtros" : "Clasificación"}
      onClose={handleSheetClose}
      closeVariant={step === "classification" ? "back" : "close"}
      closeAccessibilityLabel={
        step === "classification" ? "Volver a filtros" : "Cerrar filtros"
      }
    >
      <View
        style={{ overflow: "hidden", height: bodyHeight }}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== paneWidth) {
            setPaneWidth(nextWidth);
          }
        }}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            width: paneWidth * 2,
            height: bodyHeight,
            transform: [
              {
                translateX: stepAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -paneWidth],
                }),
              },
            ],
          }}
        >
          <View style={{ width: paneWidth, height: bodyHeight }}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
            >
              {history.length > 0 ? (
                <View className="gap-2">
                  <Text variant="label">Búsquedas recientes</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 pr-2"
                    keyboardShouldPersistTaps="handled"
                  >
                    {history.map((entry) => (
                      <Pressable
                        key={entry.id}
                        onPress={() => {
                          Keyboard.dismiss();
                          setDraft({ ...emptyFilters(), ...entry.filters });
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Aplicar búsqueda reciente: ${entry.label}`}
                        className="max-w-[220px] rounded-full border border-border bg-surface px-3 py-2 dark:border-border-dark dark:bg-surface-dark"
                      >
                        <Text variant="caption" numberOfLines={1}>
                          {entry.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <Input
                label="Título"
                placeholder="Contiene en el título..."
                value={draft.q ?? ""}
                onChangeText={(q) => setDraft((prev) => ({ ...prev, q }))}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="none"
                autoComplete="off"
                returnKeyType="done"
                blurOnSubmit
                compact
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ fontSize: FIELD_FONT_SIZE }}
              />

              <Input
                label="Artista"
                placeholder="Nombre del artista..."
                value={draft.artist ?? ""}
                onChangeText={(artist) =>
                  setDraft((prev) => ({ ...prev, artist }))
                }
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="none"
                autoComplete="off"
                returnKeyType="done"
                blurOnSubmit
                compact
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{ fontSize: FIELD_FONT_SIZE }}
              />

              <View>
                <Text variant="label">Clasificación</Text>
                <Pressable
                  onPress={() => animateToStep("classification")}
                  className="mt-1.5 h-14 flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 dark:border-border-dark dark:bg-surface-dark"
                  accessibilityRole="button"
                  accessibilityLabel="Elegir clasificación"
                  accessibilityHint="Abre la lista de clasificaciones"
                >
                  <RNText
                    numberOfLines={1}
                    className={`flex-1 pr-2 ${
                      draft.classification
                        ? "text-text dark:text-text-dark"
                        : "text-muted dark:text-muted-dark"
                    }`}
                    style={{ fontSize: FIELD_FONT_SIZE }}
                  >
                    {draft.classification ?? "Seleccionar..."}
                  </RNText>
                  <Icon name="chevron-forward" size={20} color="muted" />
                </Pressable>
              </View>

              <View
                className="flex-row items-center justify-between rounded-xl border border-border px-4 py-3 dark:border-border-dark"
                accessibilityRole="switch"
                accessibilityLabel="Solo dominio público"
                accessibilityState={{
                  checked: Boolean(draft.publicDomainOnly),
                }}
              >
                <Text variant="label">Solo dominio público</Text>
                <Switch
                  value={Boolean(draft.publicDomainOnly)}
                  onValueChange={(publicDomainOnly) => {
                    Keyboard.dismiss();
                    setDraft((prev) => ({ ...prev, publicDomainOnly }));
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.surface}
                />
              </View>

              <View
                className="flex-row items-center justify-between rounded-xl border border-border px-4 py-3 dark:border-border-dark"
                accessibilityRole="switch"
                accessibilityLabel="Solo con artista conocido"
                accessibilityState={{
                  checked: Boolean(draft.knownArtistOnly),
                }}
              >
                <Text variant="label">Solo con artista conocido</Text>
                <Switch
                  value={Boolean(draft.knownArtistOnly)}
                  onValueChange={(knownArtistOnly) => {
                    Keyboard.dismiss();
                    setDraft((prev) => ({ ...prev, knownArtistOnly }));
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.surface}
                />
              </View>
            </ScrollView>

            <View className="mt-3 flex-row gap-3 border-t border-border pt-3 dark:border-border-dark">
              <Button
                title="Resetear"
                variant="ghost"
                className="flex-1"
                onPress={clearFilters}
              />
              <Button
                title="Aplicar"
                className="flex-1"
                onPress={applyFilters}
              />
            </View>
          </View>

          <View style={{ width: paneWidth, height: bodyHeight }}>
            <ClassificationPickerList
              selected={draft.classification}
              active={visible && step === "classification"}
              maxHeight={bodyHeight}
              onSelect={(classification) => {
                setDraft((prev) => ({ ...prev, classification }));
                animateToStep("filters");
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

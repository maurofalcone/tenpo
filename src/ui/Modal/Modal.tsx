import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  View,
  type KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../Text";
import { Icon } from "../Icon";
import { useTheme } from "@/providers/ThemeProvider";
import { backdropAlpha } from "@/theme/colors";
import type { ModalProps } from "./Modal.types";
import {
  MODAL_SHEET_MS,
  SCREEN_HEIGHT,
  SHEET_OFFSET,
  keyboardOverlap,
} from "./Modal.utils";

export { MODAL_SHEET_MS } from "./Modal.utils";
export type { ModalProps } from "./Modal.types";

const SHEET_MS = MODAL_SHEET_MS;

export function Modal({
  visible,
  title,
  onClose,
  children,
  closeVariant = "close",
  closeAccessibilityLabel,
}: ModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // Siempre arranca off-screen para que el slide de apertura se vea,
  // aunque el padre monte el modal ya con visible=true.
  const sheetTranslateY = useRef(new Animated.Value(SHEET_OFFSET)).current;
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const isBack = closeVariant === "back";
  const closeLabel =
    closeAccessibilityLabel ?? (isBack ? "Volver" : "Cerrar");

  useEffect(() => {
    if (visible) {
      setRendered(true);
    } else {
      setKeyboardHeight(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(keyboardOverlap(event));
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    if (visible) {
      sheetTranslateY.setValue(SHEET_OFFSET);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: SHEET_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: SHEET_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: SHEET_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_OFFSET,
        duration: SHEET_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setRendered(false);
      }
    });
  }, [backdropOpacity, rendered, sheetTranslateY, visible]);

  const keyboardOpen = keyboardHeight > 0;
  // Solo safe-area. En Android el sistema ya mueve el Dialog con el teclado;
  // si sumamos keyboardHeight acá queda el “hueco gigante” bajo los botones.
  const bottomPad = Math.max(insets.bottom, 16);
  const sheetMaxHeight =
    Platform.OS === "ios" && keyboardOpen
      ? SCREEN_HEIGHT * 0.55
      : SCREEN_HEIGHT * 0.9;

  const sheet = (
    <Animated.View
      pointerEvents="box-none"
      style={{
        width: "100%",
        paddingBottom: bottomPad,
        backgroundColor: colors.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        transform: [{ translateY: sheetTranslateY }],
      }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 12,
          backgroundColor: colors.bg,
          maxHeight: sheetMaxHeight,
          overflow: "hidden",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <View className="mb-2.5 flex-row items-center justify-between">
          <Text variant="subtitle" className="flex-shrink">
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Icon
              name={isBack ? "chevron-back" : "close"}
              size={22}
              color="muted"
            />
          </Pressable>
        </View>
        <View style={{ flexShrink: 1, minHeight: 0 }}>{children}</View>
      </View>
    </Animated.View>
  );

  return (
    <RNModal
      visible={rendered}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        collapsable={false}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: backdropAlpha(0.5),
            opacity: backdropOpacity,
          }}
        />
        <Pressable
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar fondo"
        />

        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={{ width: "100%", justifyContent: "flex-end" }}
            pointerEvents="box-none"
          >
            {sheet}
          </KeyboardAvoidingView>
        ) : (
          sheet
        )}
      </View>
    </RNModal>
  );
}

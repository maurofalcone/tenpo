import { Tabs } from "expo-router";
import { Icon } from "@/ui";
import { fadeHeaderScreenOptions } from "@/ui/FadeHeaderBackground";
import { useTheme } from "@/providers/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: true,
        headerTitle: () => null,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        animation: "shift",
        transitionSpec: {
          animation: "timing",
          config: { duration: 220 },
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          ...fadeHeaderScreenOptions,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Colección",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "images" : "images-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          ...fadeHeaderScreenOptions,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

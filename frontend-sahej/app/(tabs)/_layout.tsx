import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import { useThemePreference } from "../../src/theme/ThemeProvider";

function TabIcon({
  color,
  focused,
  name
}: {
  color: string;
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={[
        styles.iconWrap,
        focused && {
          backgroundColor: `${color}1D`,
          borderColor: `${color}55`
        }
      ]}
    >
      <Ionicons color={color} name={name} size={focused ? 24 : 22} />
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useThemePreference();
  const isLight = theme.background.startsWith("#f");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 16,
          height: 78,
          borderRadius: 26,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: isLight ? "rgba(255, 251, 246, 0.92)" : "rgba(17, 20, 32, 0.9)",
          shadowColor: theme.shadow,
          shadowOffset: {
            width: 0,
            height: 10
          },
          shadowOpacity: isLight ? 0.14 : 0.32,
          shadowRadius: 24,
          elevation: 14,
          paddingTop: 8,
          paddingBottom: 10
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 1
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 1
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: 26,
                backgroundColor: isLight ? "rgba(255, 251, 246, 0.88)" : "rgba(17, 20, 32, 0.86)"
              }
            ]}
          />
        )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="home-outline" />
        }}
      />
      <Tabs.Screen
        name="log-feeling"
        options={{
          title: "Log Feeling",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="heart-outline" />
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="book-outline" />
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: "Thought Map",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="git-network-outline" />
          )
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="document-text-outline" />
          )
        }}
      />
      <Tabs.Screen
        name="emotions"
        options={{
          title: "Emotions",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="color-palette-outline" />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 14,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    minWidth: 38
  }
});

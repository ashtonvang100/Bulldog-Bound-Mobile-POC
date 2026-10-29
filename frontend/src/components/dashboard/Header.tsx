import { headerStyles as styles } from "@/constants/dashboard/Header";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
type Props = { onHome: () => void; onMenu: () => void; onUser: () => void };
export function Header({ onHome, onMenu, onUser }: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fresno State Mobile home"
        onPress={onHome}
        style={({ pressed }) => [styles.home, pressed && styles.pressed]}
      >
        <Image
          source={require("../../../assets/dashboard/home.png")}
          style={styles.brand}
          resizeMode="contain"
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bulldog Bound home"
        onPress={() =>
          router.push({
            pathname: "/web",
            params: {
              title: "Bulldog Bound home",
              url: "https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/index",
            },
          })
        }
        style={({ pressed }) => [styles.module, pressed && styles.pressed]}
      >
        <Image
          source={require("../../../assets/dashboard/enrollment.png")}
          style={styles.moduleIcon}
        />
      </Pressable>
      <Text numberOfLines={2} style={styles.title}>
        Bulldog Bound Guest
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open user menu"
        onPress={onUser}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          source={require("../../../assets/dashboard/user.png")}
          style={styles.icon}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        onPress={onMenu}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          source={require("../../../assets/dashboard/menu.png")}
          style={styles.icon}
        />
      </Pressable>
    </View>
  );
}

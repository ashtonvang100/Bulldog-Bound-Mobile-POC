import { actionRowStyles as styles } from "@/constants/dashboard/ActionRow";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
export function ActionRow({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        secondary && styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>
        {title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={secondary ? colors.red : "white"}
      />
    </Pressable>
  );
}

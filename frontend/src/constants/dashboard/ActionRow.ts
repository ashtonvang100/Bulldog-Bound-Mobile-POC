import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const actionRowStyles = StyleSheet.create({
  row: {
    minHeight: 52,
    backgroundColor: colors.link,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: { flex: 1, color: "white", fontSize: 16 },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 16,
  },
  secondaryText: { color: colors.red },
  pressed: { opacity: 0.7 },
});

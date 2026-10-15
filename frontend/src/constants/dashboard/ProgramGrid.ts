import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const programGridStyles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: 20,
  },
  tile: {
    width: "25%",
    minWidth: 70,
    minHeight: 112,
    alignItems: "center",
    paddingVertical: 4,
  },
  image: { width: "100%", maxWidth: 84, aspectRatio: 1 },
  label: { fontSize: 16, fontWeight: "700", color: colors.navy, marginTop: 4 },
  pressed: { backgroundColor: "#f1f1f1", borderRadius: 8 },
});

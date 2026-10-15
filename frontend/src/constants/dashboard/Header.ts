import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const headerStyles = StyleSheet.create({
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.red,
  },
  home: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { width: 48, height: 48 },
  module: {
    width: 46,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#d26577",
  },
  moduleIcon: { width: 30, height: 30 },
  title: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    paddingHorizontal: 10,
  },
  button: { width: 48, height: 48 },
  icon: { width: 48, height: 48 },
  pressed: { backgroundColor: "#940e24" },
});

import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const mediaPlaceholderStyles = StyleSheet.create({
  media: {
    height: 220,
    overflow: "hidden",
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  fill: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
  shade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00000030",
  },
  title: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 12,
    color: "white",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowRadius: 3,
  },
  play: {
    backgroundColor: "#e62117",
    width: 64,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
  caption: {
    position: "absolute",
    bottom: 12,
    left: 12,
    color: "white",
    fontSize: 13,
  },
  pressed: { opacity: 0.8 },
});

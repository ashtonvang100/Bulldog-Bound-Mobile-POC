import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const dashboardStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.red },
  body: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 24 },
  hero: {
    width: "100%",
    maxWidth: 600,
    aspectRatio: 800 / 533,
    alignSelf: "center",
  },
  introduction: { backgroundColor: colors.navy },
  introContent: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 36,
    lineHeight: 45,
    fontWeight: "400",
    marginBottom: 16,
  },
  description: { color: "white", fontSize: 18, lineHeight: 24 },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actions: { gap: 8, marginTop: 16 },
  section: { marginTop: 24, paddingHorizontal: 6 },
  sectionTitle: { fontSize: 24, color: "#000", marginBottom: 8 },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#000",
    fontWeight: "300",
  },
});

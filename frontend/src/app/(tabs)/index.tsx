import { dashboardStyles as styles } from "@/constants/dashboard/dashboard";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/dashboard/Header";
import { ActionRow } from "@/components/dashboard/ActionRow";
import { MediaPlaceholder } from "@/components/dashboard/MediaPlaceholder";
import { ProgramGrid } from "@/components/dashboard/ProgramGrid";
import { PreviewModal } from "@/components/dashboard/PreviewModal";
import { introduction, type Preview } from "@/data/dashboard";
import { router } from "expo-router";

export default function Dashboard() {
  const scroll = useRef<ScrollViewInstance>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [menu, setMenu] = useState<"navigation" | "user" | null>(null);
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <Header
        onHome={() => scroll.current?.scrollTo({ y: 0, animated: true })}
        onUser={() => setMenu("user")}
        onMenu={() => setMenu("navigation")}
      />
      <View style={styles.body}>
        <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
          <Image
            source={require("../../../assets/dashboard/hero.jpg")}
            accessibilityLabel="President Sandoval speaking to students at Fresno State"
            style={styles.hero}
            resizeMode="contain"
          />
          <View style={styles.introduction}>
            <View style={styles.introContent}>
              <Text accessibilityRole="header" style={styles.title}>
                Bulldog Bound
              </Text>
              <Text style={styles.description}>{introduction}</Text>
            </View>
          </View>
          <View style={styles.content}>
            <MediaPlaceholder />
            <View style={styles.actions}>
              <ActionRow
                title="Registration Form"
                onPress={() =>
                  router.push({
                    pathname: "/web",
                    params: {
                      title: "Registration Form",
                      url: "https://fresnostate.kualibuild.com/app/647e017bb9012f0208e789e0/start",
                    },
                  })
                }
              />
              <ActionRow
                title="Visit Bulldog Bound Website"
                onPress={() =>
                  router.push({
                    pathname: "/web",
                    params: {
                      title: "Visit Bulldog Bound Website",
                      url: "https://studentaffairs.fresnostate.edu/are/bound/index.html",
                    },
                  })
                }
              />
            </View>
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Program Information
              </Text>
              <Text style={styles.sectionDescription}>
                Read more about specific grade level milestones for 9th-12th
                graders part of Bulldog Bound.
              </Text>
            </View>
            <ProgramGrid onSelect={setPreview} />
            <ActionRow
              title="QR TEST"
              secondary
              onPress={() =>
                setPreview({
                  title: "QR TEST",
                  description:
                    "The original link opens check-in. QR scanning and event check-in are unavailable in this frontend prototype.",
                })
              }
            />
          </View>
        </ScrollView>
      </View>
      <PreviewModal
        key={menu ?? "preview"}
        preview={preview}
        menu={menu}
        onClose={() => {
          setPreview(null);
          setMenu(null);
        }}
        onSelect={(item) => {
          setMenu(null);
          setPreview(item);
        }}
      />
    </SafeAreaView>
  );
}

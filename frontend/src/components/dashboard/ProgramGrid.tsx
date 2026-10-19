import { programGridStyles as styles } from "@/constants/dashboard/ProgramGrid";
import { Image, Pressable, Text, View } from "react-native";
import { grades, type Preview } from "@/data/dashboard";
import { router } from "expo-router";

export function ProgramGrid({
  onSelect,
}: {
  onSelect: (preview: Preview) => void;
}) {
  return (
    <View style={styles.grid}>
      {grades.map((grade) => (
        <Pressable
          key={grade.title}
          accessibilityRole="button"
          accessibilityLabel={`${grade.title} grade program information`}
          onPress={() =>
            router.push({
              pathname: "/web",
              params: {
                title: `${grade.title} Grade Overview`,
                url: grade.url,
              },
            })
          }
          style={styles.tile}
        >
          <Image
            source={grade.image}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.label}>{grade.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

import { programGridStyles as styles } from "@/constants/dashboard/ProgramGrid";
import { Image, Pressable, Text, View } from "react-native";
import { grades, type Preview } from "@/data/dashboard";
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
            onSelect({
              ...grade,
              title: `${grade.title} Grade`,
              description: `This tile opens the ${grade.title} grade milestones on the original dashboard. Grade-specific content is a placeholder in this local prototype.`,
            })
          }
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
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

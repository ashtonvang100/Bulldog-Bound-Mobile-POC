import { mediaPlaceholderStyles as styles } from "@/constants/dashboard/MediaPlaceholder";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
export function MediaPlaceholder({ onPress }: { onPress?: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel="Preview Bulldog Bound overview video"
      onPress={onPress}
      style={({ pressed }) => [styles.media, pressed && styles.pressed]}
    >
      {!failed && (
        <Image
          source={require("../../../assets/dashboard/video.jpg")}
          onError={() => setFailed(true)}
          style={styles.fill}
          resizeMode="cover"
        />
      )}
      <View style={styles.shade} />
      <Text style={styles.title}>Bulldog Bound | Fresno State</Text>
      <View style={styles.play}>
        <Ionicons name="play" size={30} color="white" />
      </View>
      <Text style={styles.caption}>Overview Video</Text>
    </Pressable>
  );
}

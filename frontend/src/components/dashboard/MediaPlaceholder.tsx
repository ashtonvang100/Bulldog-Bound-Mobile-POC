import { mediaPlaceholderStyles as styles } from "@/constants/dashboard/MediaPlaceholder";
import YoutubePlayer from "react-native-youtube-iframe";

export function MediaPlaceholder() {
  return (
    <YoutubePlayer
      height={220}
      videoId="JWn3FSJ2biE"
      viewContainerStyle={styles.media}
    />
  );
}

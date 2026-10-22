import { ExternalWebsite } from "@/components/ExternalWebsite";
import { useLocalSearchParams } from "expo-router";

export default function WebScreen() {
  const params = useLocalSearchParams<{
    url?: string | string[];
    title?: string | string[];
  }>();
  const url = Array.isArray(params.url) ? params.url[0] : params.url;
  const title =
    (Array.isArray(params.title) ? params.title[0] : params.title) || "Website";
  // Reset both the WebView and its history state when the destination changes.
  return <ExternalWebsite key={url} url={url} title={title} />;
}

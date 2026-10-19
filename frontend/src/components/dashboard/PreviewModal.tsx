import { previewModalStyles as styles } from "@/constants/dashboard/PreviewModal";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { navigationItems, userItems, type Preview } from "@/data/dashboard";
type Props = {
  preview: Preview | null;
  menu: "navigation" | "user" | null;
  onClose: () => void;
  onSelect: (item: Preview) => void;
};
export function PreviewModal({ preview, menu, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const items: { title: string; url?: string }[] =
    menu === "user" ? userItems.map((title) => ({ title })) : navigationItems;
  const matches = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Modal
      visible={!!preview || !!menu}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.heading}>
              {menu
                ? menu === "user"
                  ? "User"
                  : "Navigation"
                : preview?.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={menu ? "Close menu" : "Close preview"}
              onPress={onClose}
              style={styles.close}
            >
              <Ionicons name="close" size={28} color={colors.navy} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {menu ? (
              <>
                {menu === "navigation" && (
                  <TextInput
                    accessibilityLabel="Search navigation"
                    placeholder="Search"
                    placeholderTextColor="#767676"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.search}
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                  />
                )}
                {menu === "navigation" && (
                  <Text style={styles.menuHeading}>My Menu</Text>
                )}
                {menu === "navigation" && !query && (
                  <Pressable
                    accessibilityRole="button"
                    style={styles.item}
                    onPress={() =>
                      onSelect({
                        title: "Add items to my menu",
                        description:
                          "Menu customization is unavailable in this local prototype.",
                      })
                    }
                  >
                    <Text style={styles.itemText}>Add items to my menu</Text>
                    <Ionicons name="add" size={22} color={colors.red} />
                  </Pressable>
                )}
                {matches.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.title}
                    style={({ pressed }) => [
                      styles.item,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => {
                      if (menu === "navigation") {
                        onClose();
                        router.push({
                          pathname: "/web",
                          params: { title: item.title, url: item.url ?? "" },
                        });
                        return;
                      }
                      onSelect({
                        title: item.title,
                        description: `${item.title} is a preview destination. No university services or accounts are connected to this frontend prototype.`,
                      });
                    }}
                  >
                    <Text style={styles.itemText}>{item.title}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.red}
                    />
                  </Pressable>
                ))}
                {!matches.length && (
                  <Text style={styles.description}>
                    No matching menu items.
                  </Text>
                )}
              </>
            ) : (
              <>
                {preview?.image && (
                  <Image
                    source={preview.image}
                    style={styles.grade}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.badge}>LOCAL PROTOTYPE PREVIEW</Text>
                <Text style={styles.description}>{preview?.description}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.return,
                    pressed && styles.returnPressed,
                  ]}
                >
                  <Text style={styles.returnText}>Back to dashboard</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

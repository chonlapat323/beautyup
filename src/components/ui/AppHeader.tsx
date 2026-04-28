import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, spacing } from "@/theme";

type BreadcrumbItem = {
  label: string;
  onPress?: () => void;
};

type AppHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AppHeader({
  breadcrumbs,
  title,
  subtitle,
  showSearch = false,
  onSearchPress,
}: AppHeaderProps) {
  const { width } = useWindowDimensions();
  const member = useAppStore((state) => state.member);

  const horizontalPadding = width < 360 ? 18 : width >= 430 ? 28 : 24;
  const shellBottomPadding = showSearch ? (width < 360 ? 18 : 22) : 18;
  const initials = member?.fullName?.trim().charAt(0).toUpperCase() ?? "B";
  const displayName = member?.fullName ?? "Beauty Up";
  const hasCopy = Boolean(title || subtitle || breadcrumbs?.length);

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: shellBottomPadding,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.profileGroup}>
          <View style={styles.avatarShell}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.profileCopy}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text numberOfLines={1} style={styles.memberName}>
              {displayName}
            </Text>
          </View>
        </View>

        <PointsPillInline />
      </View>

      {showSearch ? (
        <Pressable onPress={onSearchPress} style={styles.searchBar}>
          <View style={styles.searchIconWrap}>
            <MaterialIcons name="search" size={18} color="#4E6B58" />
          </View>
          <Text style={styles.searchPlaceholder}>Search haircare products</Text>
        </Pressable>
      ) : null}

      {hasCopy ? (
        <View style={styles.copyBlock}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {breadcrumbs?.length ? (
            <View style={styles.breadcrumbRow}>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const content = (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.breadcrumbText,
                      item.onPress && !isLast
                        ? styles.breadcrumbLink
                        : styles.breadcrumbCurrent,
                    ]}
                  >
                    {item.label}
                  </Text>
                );

                return (
                  <View key={`${item.label}-${index}`} style={styles.breadcrumbItem}>
                    {item.onPress && !isLast ? (
                      <Pressable onPress={item.onPress}>{content}</Pressable>
                    ) : (
                      content
                    )}
                    {!isLast ? <Text style={styles.breadcrumbSeparator}>/</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PointsPillInline() {
  const member = useAppStore((state) => state.member);
  if (!member) return null;

  return (
    <View style={styles.pill}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="auto-awesome" size={14} color={colors.primaryDark} />
      </View>
      <Text style={styles.pillText}>{member.pointBalance.toLocaleString()} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FBF8",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(31, 82, 54, 0.08)",
    shadowColor: "#183322",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  profileGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  avatarShell: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E8F3EC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D3E5DA",
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#295B3F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1D412D",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  profileCopy: {
    gap: 2,
    flex: 1,
    paddingTop: 4,
  },
  greeting: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: "#6B8474",
  },
  memberName: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fonts.extraBold,
    color: "#173022",
  },
  searchBar: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(41, 91, 63, 0.08)",
    shadowColor: "#214530",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E9F3EC",
    alignItems: "center",
    justifyContent: "center",
  },
  searchPlaceholder: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#5E7767",
  },
  copyBlock: {
    paddingTop: spacing.lg,
    gap: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontFamily: fonts.extraBold,
    color: "#173022",
    paddingTop: 2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: "#5E7767",
  },
  breadcrumbRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 6,
    rowGap: 4,
    paddingTop: 2,
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  breadcrumbText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
  },
  breadcrumbLink: {
    color: colors.primaryStrong,
  },
  breadcrumbCurrent: {
    color: "#6B8474",
  },
  breadcrumbSeparator: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: "#8AA091",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECF5EE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D3E5DA",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
});

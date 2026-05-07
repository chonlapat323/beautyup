import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import type { ProfileStackParamList } from "@/navigation/types";
import type { CreditTransaction, WithdrawalRequest } from "@/services/api";
import { mobileGetCreditTransactions, mobileGetWithdrawals } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, typography } from "@/theme";

type ListItem =
  | { kind: "tx"; data: CreditTransaction }
  | { kind: "wd"; data: WithdrawalRequest };

const TYPE_LABEL: Record<string, string> = { EARN: "ได้รับ", USE: "ใช้งาน", WITHDRAW: "ถอน" };
const TYPE_COLOR: Record<string, string> = { EARN: "#2f7a4f", USE: "#c84b44", WITHDRAW: "#b45309" };

const WD_STATUS_LABEL: Record<string, string> = { PENDING: "รอดำเนินการ", APPROVED: "อนุมัติแล้ว", REJECTED: "ปฏิเสธแล้ว" };
const WD_STATUS_COLOR: Record<string, string> = { PENDING: "#b45309", APPROVED: "#2f7a4f", REJECTED: "#6b7280" };

export function CreditHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      mobileGetCreditTransactions(token),
      mobileGetWithdrawals(token),
    ]).then(([txs, wds]) => {
      const all: ListItem[] = [
        ...txs.map((d): ListItem => ({ kind: "tx", data: d })),
        ...wds.map((d): ListItem => ({ kind: "wd", data: d })),
      ].sort((a, b) => {
        const dateA = new Date(a.data.createdAt).getTime();
        const dateB = new Date(b.data.createdAt).getTime();
        return dateB - dateA;
      });
      setItems(all);
    }).catch(() => null).finally(() => setIsLoading(false));
  }, [token]);

  function renderItem({ item }: { item: ListItem }) {
    const date = new Date(item.data.createdAt).toLocaleDateString("th-TH", {
      day: "2-digit", month: "short", year: "numeric",
    });

    if (item.kind === "tx") {
      const tx = item.data;
      const isPositive = tx.type === "EARN";
      return (
        <View style={styles.row}>
          <View style={[styles.typeBadge, { backgroundColor: TYPE_COLOR[tx.type] + "18" }]}>
            <Text style={[styles.typeBadgeText, { color: TYPE_COLOR[tx.type] }]}>
              {TYPE_LABEL[tx.type] ?? tx.type}
            </Text>
          </View>
          <View style={styles.rowMid}>
            <Text style={styles.rowNote} numberOfLines={1}>{tx.note ?? "—"}</Text>
            <Text style={styles.rowDate}>{date}</Text>
          </View>
          <Text style={[styles.rowAmount, { color: TYPE_COLOR[tx.type] }]}>
            {isPositive ? "+" : "-"}฿{Number(tx.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      );
    }

    const wd = item.data;
    return (
      <View style={styles.row}>
        <View style={[styles.typeBadge, { backgroundColor: "#b4530918" }]}>
          <Text style={[styles.typeBadgeText, { color: "#b45309" }]}>ถอน</Text>
        </View>
        <View style={styles.rowMid}>
          <Text style={styles.rowNote}>
            คำขอถอน —{" "}
            <Text style={{ color: WD_STATUS_COLOR[wd.status] }}>
              {WD_STATUS_LABEL[wd.status] ?? wd.status}
            </Text>
          </Text>
          <Text style={styles.rowDate}>{date}</Text>
        </View>
        <Text style={[styles.rowAmount, { color: "#b45309" }]}>
          -฿{Number(wd.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </Text>
      </View>
    );
  }

  return (
    <Screen
      header={
        <AppHeader
          title="ประวัติ Credit"
          subtitle="รายการ EARN / USE / WITHDRAW"
          breadcrumbs={[
            { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
            { label: "ประวัติ Credit" },
          ]}
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing["3xl"] }} color={colors.primary} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>ยังไม่มีรายการ credit</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.data.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  typeBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minWidth: 52,
    alignItems: "center",
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  rowMid: {
    flex: 1,
    gap: 2,
  },
  rowNote: {
    color: colors.textPrimary,
    ...typography.caption,
  },
  rowDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rowAmount: {
    ...typography.body,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    ...typography.body,
    marginTop: spacing["3xl"],
  },
});

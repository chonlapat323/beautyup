import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

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

const TX_CONFIG: Record<string, { label: string; color: string; sign: "+" | "-" }> = {
  EARN:     { label: "ได้รับ",  color: "#4ade80", sign: "+" },
  USE:      { label: "ใช้งาน", color: "#f87171", sign: "-" },
};

const WD_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "รอดำเนินการ", color: "#92400e", bg: "#fef3c7" },
  APPROVED: { label: "อนุมัติแล้ว", color: "#2f7a4f", bg: "#dcfce7" },
  REJECTED: { label: "ไม่อนุมัติ",  color: "#6b7280", bg: "#f3f4f6" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatAmt(v: string) {
  return `฿${Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
}

function formatNote(note: string | null): string {
  if (!note) return "—";
  const match = note.match(/^Commission จากออเดอร์ (.+)$/);
  if (match) {
    const ref = match[1];
    return ref.startsWith("BU-") ? `คอมมิชชันจากออเดอร์ ${ref}` : "คอมมิชชัน";
  }
  return note;
}

export function CreditHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const token = useAppStore((s) => s.token);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    Promise.all([
      mobileGetCreditTransactions(token),
      mobileGetWithdrawals(token),
    ]).then(([txs, wds]) => {
      const all: ListItem[] = [
        // exclude WITHDRAW type — already represented by WithdrawalRequest entries
        ...txs.filter((t) => t.type !== "WITHDRAW").map((d): ListItem => ({ kind: "tx", data: d })),
        ...wds.map((d): ListItem => ({ kind: "wd", data: d })),
      ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
      setItems(all);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }).finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [token]);

  function renderItem({ item }: { item: ListItem }) {
    if (item.kind === "tx") {
      const tx = item.data;
      const cfg = TX_CONFIG[tx.type];
      if (!cfg) return null;
      return (
        <View style={styles.card}>
          <View style={[styles.badge, { backgroundColor: cfg.color + "18" }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={styles.cardNote} numberOfLines={2}>{formatNote(tx.note)}</Text>
            <Text style={styles.cardDate}>{formatDate(tx.createdAt)}</Text>
          </View>
          <Text style={[styles.cardAmount, { color: cfg.color }]}>
            {cfg.sign}{formatAmt(tx.amount)}
          </Text>
        </View>
      );
    }

    const wd = item.data;
    const st = WD_STATUS[wd.status] ?? WD_STATUS.PENDING;
    return (
      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: "#b4530918" }]}>
          <Text style={[styles.badgeText, { color: "#b45309" }]}>ถอน</Text>
        </View>
        <View style={styles.cardMid}>
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusPillText, { color: st.color }]}>{st.label}</Text>
          </View>
          {wd.bankName ? (
            <Text style={styles.bankInfo} numberOfLines={1}>
              {wd.bankName} · {wd.bankAccountNumber}
            </Text>
          ) : null}
          {wd.bankAccountName ? (
            <Text style={styles.bankName} numberOfLines={1}>{wd.bankAccountName}</Text>
          ) : null}
          <Text style={styles.cardDate}>{formatDate(wd.createdAt)}</Text>
          {wd.note ? (
            <Text style={styles.rejectNote}>หมายเหตุ: {wd.note}</Text>
          ) : null}
        </View>
        <Text style={[styles.cardAmount, { color: "#b45309" }]}>
          -{formatAmt(wd.amount)}
        </Text>
      </View>
    );
  }

  const appHeader = (
    <AppHeader
      title="ประวัติเครดิต"
      subtitle="รายการรับเข้า / ใช้งาน / ถอน"
      breadcrumbs={[
        { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
        { label: "ประวัติเครดิต" },
      ]}
    />
  );

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        {appHeader}
        <ActivityIndicator style={{ marginTop: spacing["3xl"] }} color={colors.primary} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scrollable={false}>
        {appHeader}
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryBtnText}>ลองใหม่</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen scrollable={false}>
        {appHeader}
        <Text style={styles.empty}>ยังไม่มีรายการเครดิต</Text>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      {appHeader}
      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(item) => item.data.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minWidth: 56,
    alignItems: "center",
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardMid: {
    flex: 1,
    gap: 3,
  },
  cardNote: {
    color: "rgba(255,255,255,0.9)",
    ...typography.caption,
  },
  cardDate: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },
  cardAmount: {
    ...typography.body,
    fontWeight: "700",
    minWidth: 80,
    textAlign: "right",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bankInfo: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  bankName: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },
  rejectNote: {
    color: "#b45309",
    fontSize: 11,
    fontStyle: "italic",
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  empty: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    ...typography.body,
    marginTop: spacing["3xl"],
  },
  errorBox: {
    alignItems: "center",
    marginTop: spacing["3xl"],
    paddingHorizontal: spacing["2xl"],
    gap: spacing.md,
  },
  errorText: {
    color: "#c84b44",
    ...typography.body,
    textAlign: "center",
  },
  retryBtn: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  retryBtnText: {
    color: colors.primary,
    fontWeight: "600",
    ...typography.body,
  },
});

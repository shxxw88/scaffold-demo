import Grant from "@/components/grant";
import GrantFilterSheet, {
  GRANT_SORT_OPTIONS,
  GrantSortId,
} from "@/components/GrantFilterSheet";
import GrantSubFilters from "@/components/GrantSubFilters";
import {
  evaluateGrantEligibility,
  grantCatalog,
  GrantDefinition,
} from "@/constants/grants";
import { Theme } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type GrantListItem = GrantDefinition & {
  eligible: boolean;
  saved: boolean;
  applied: boolean;
};

const getAmountValue = (amount: string) => {
  const numeric = amount.replace(/[^0-9.]/g, "");
  const value = parseFloat(numeric);
  return Number.isNaN(value) ? 0 : value;
};

const getDeadlineTimestamp = (deadline: string) => {
  const year = new Date().getFullYear();
  const parts = deadline.split("-").map((part) => part.trim());
  const target = parts[parts.length - 1] || deadline;
  if (!target.includes("/")) return 0;
  const sanitized = target.replace(/[^0-9/]/g, "");
  const [monthStr, dayStr] = sanitized.split("/");
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (Number.isNaN(month) || Number.isNaN(day)) return 0;
  return new Date(year, month - 1, day).getTime();
};

const normalizeTab = (value?: string): "All" | "Eligible" | "My Grants" => {
  if (value === "Eligible") return "Eligible";
  if (value === "My Grants") return "My Grants";
  return "All";
};

const readTabParam = (
  value: string | string[] | undefined
): "All" | "Eligible" | "My Grants" => {
  if (!value) return "All";
  const raw = Array.isArray(value) ? value[0] : value;
  return normalizeTab(raw);
};

export default function GrantsScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams<{ tab?: string }>();
  const { profileData } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "All" | "Eligible" | "My Grants"
  >(() => readTabParam(params.tab));
  const [selectedSubFilter, setSelectedSubFilter] =
    useState<"Saved" | "Applied">("Saved");
  const [grantState, setGrantState] = useState<
    Record<string, { saved: boolean; applied: boolean }>
  >(() =>
    grantCatalog.reduce<Record<string, { saved: boolean; applied: boolean }>>(
      (acc, grant) => {
        acc[grant.id] = { saved: false, applied: false };
        return acc;
      },
      {}
    )
  );
  const [selectedSortId, setSelectedSortId] = useState<GrantSortId>("all");
  const [sortVisible, setSortVisible] = useState(false);

  useEffect(() => {
    setSelectedTab(readTabParam(params.tab));
  }, [params.tab]);

  const tabs: ("All" | "Eligible" | "My Grants")[] = [
    "All",
    "Eligible",
    "My Grants",
  ];

  const grantsWithEligibility: GrantListItem[] = useMemo(() => {
    return grantCatalog.map((grant) => {
      const state = grantState[grant.id] ?? { saved: false, applied: false };
      const eligibility = evaluateGrantEligibility(grant, profileData);
      return {
        ...grant,
        eligible: eligibility.eligible,
        saved: state.saved,
        applied: state.applied,
      };
    });
  }, [grantState, profileData]);

  const filteredGrants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const bySearch = (g: GrantListItem) =>
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.organization.toLowerCase().includes(q);

    let result = grantsWithEligibility.filter(bySearch);

    if (selectedTab === "Eligible") {
      result = result.filter((g) => g.eligible);
    } else if (selectedTab === "My Grants") {
      if (selectedSubFilter === "Saved")
        result = result.filter((g) => g.saved);
      else if (selectedSubFilter === "Applied")
        result = result.filter((g) => g.applied);
      else result = result.filter((g) => g.saved || g.applied);
    }

    let finalResult = [...result];
    switch (selectedSortId) {
      case "active":
        finalResult = finalResult.filter((g) => g.active);
        break;
      case "newest":
        finalResult = finalResult.sort(
          (a, b) => getDeadlineTimestamp(b.deadline) - getDeadlineTimestamp(a.deadline)
        );
        break;
      case "oldest":
        finalResult = finalResult.sort(
          (a, b) => getDeadlineTimestamp(a.deadline) - getDeadlineTimestamp(b.deadline)
        );
        break;
      case "amountHigh":
        finalResult = finalResult.sort(
          (a, b) => getAmountValue(b.amount) - getAmountValue(a.amount)
        );
        break;
      case "amountLow":
        finalResult = finalResult.sort(
          (a, b) => getAmountValue(a.amount) - getAmountValue(b.amount)
        );
        break;
      default:
        break;
    }

    if (selectedTab === "All") {
      const eligibleItems = finalResult.filter((g) => g.eligible);
      const otherItems = finalResult.filter((g) => !g.eligible);
      finalResult = [...eligibleItems, ...otherItems];
    }

    return finalResult;
  }, [
    grantsWithEligibility,
    searchQuery,
    selectedTab,
    selectedSubFilter,
    selectedSortId,
  ]);

  const selectedSortLabel =
    GRANT_SORT_OPTIONS.find((option) => option.id === selectedSortId)?.label ??
    "All";

  const handleGrantPress = (grant: GrantListItem) => {
    router.push({
      pathname: "/grant-details",
      params: {
        id: grant.id,
        saved: grant.saved ? "true" : "false",
      },
    });
  };

  const handleApplyPress = (grant: GrantListItem) => {
    setGrantState((prev) => {
      const current = prev[grant.id] ?? { saved: false, applied: false };
      return {
        ...prev,
        [grant.id]: { ...current, applied: true },
      };
    });
  };

  const handleSavePress = (grant: GrantListItem) => {
    setGrantState((prev) => {
      const current = prev[grant.id] ?? { saved: false, applied: false };
      return {
        ...prev,
        [grant.id]: { ...current, saved: !current.saved },
      };
    });
  };

  const sectionTitle =
    selectedTab === "My Grants"
      ? selectedSubFilter === "Saved"
        ? "Saved grants"
        : "Applied grants"
      : selectedTab === "Eligible"
      ? "Eligible grants for you"
      : "Suggested grants for you";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[Theme.typography.h2, { color: Theme.colors.black }]}>
          All Grants
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab, idx) => {
          const active = selectedTab === tab;
          const isLast = idx === tabs.length - 1;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabBtn,
                !isLast && { marginRight: 8 },
                {
                  backgroundColor: active
                    ? Theme.colors.brightPurple
                    : Theme.colors.lightGrey,
                },
              ]}
            >
              <Text
                style={[
                  Theme.typography.label,
                  { color: active ? Theme.colors.white : Theme.colors.darkGrey },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subfilters for My Grants */}
      {selectedTab === "My Grants" && (
        <View
          style={{
            paddingHorizontal: Theme.spacing.lg,
            marginBottom: Theme.spacing.sm,
          }}
        >
          <GrantSubFilters
            selectedFilter={selectedSubFilter}
            onFilterChange={setSelectedSubFilter}
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchInner}>
          <TextInput
            style={styles.searchInput}
            placeholder="Find Grants"
            placeholderTextColor={Theme.colors.purple}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search"
            size={18}
            color={Theme.colors.grey}
            style={styles.searchIcon}
          />
        </View>
      </View>

      {/* Section title + sort */}
      <View style={styles.sectionHeader}>
        <Text style={[Theme.typography.subhead1, { color: Theme.colors.black }]}>
          {sectionTitle}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => setSortVisible(true)}
          style={styles.sortTrigger}
        >
          <Ionicons name="swap-vertical" size={20} color={Theme.colors.darkGrey} />
          <Text
            style={[
              Theme.typography.label,
              { marginLeft: 6, color: Theme.colors.darkGrey },
            ]}
          >
            {selectedSortLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredGrants}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Grant
            id={item.id}
            title={item.title}
            organization={item.organization}
            amount={item.amount}
            deadline={item.deadline}
            category={item.category}
            description={item.description}
            imageUrl={item.imageUrl}
            eligible={item.eligible}
            saved={item.saved}
            applied={item.applied}
            active={item.active}
            onPress={() => handleGrantPress(item)}
            onSave={() => handleSavePress(item)}
            onNavigateToApply={() => {
              handleApplyPress(item);
              router.push({
                pathname: "/grant-details",
                params: { id: item.id, saved: item.saved ? "true" : "false" },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Theme.typography.subhead1, { marginTop: Theme.spacing.lg, color: Theme.colors.grey }]}>
              No grants found
            </Text>
            <Text style={[Theme.typography.body, { marginTop: 6, color: Theme.colors.grey}]}>
              Try adjusting your search or tab filter
            </Text>
          </View>
        }
      />

      <GrantFilterSheet
        visible={sortVisible}
        selectedId={selectedSortId}
        onSelect={setSelectedSortId}
        onClose={() => setSortVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  header: {
    alignSelf: "center",
    width: Theme.layout.width,
    paddingTop: 24,
    paddingBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
  },
  tabsRow: {
    flexDirection: "row",
    alignSelf: "center",
    width: Theme.layout.width,
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    ...Theme.padding.buttonMd,
    borderRadius: Theme.radius.button,
  },
  searchWrap: {
    alignSelf: "center",
    width: Theme.layout.width,
    marginBottom: Theme.spacing.lg,
  },
  searchInner: {
    position: "relative",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Theme.colors.purpleStroke,
    borderRadius: Theme.radius.search,
    ...Theme.padding.buttonLg,
    paddingHorizontal: Theme.spacing.lg,
    paddingRight: 36,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.darkGrey,
    backgroundColor: Theme.colors.white,
  },
  searchIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  sectionHeader: {
    alignSelf: "center",
    width: Theme.layout.width,
    marginBottom: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortTrigger: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: Theme.spacing.md,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
});

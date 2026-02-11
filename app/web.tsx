import ApplicationTab from "@/components/ApplicationTab";
import ApplicationTemplet from "@/components/ApplicationTemplet";
// import LogInButton from "@/components/LogInButton";
import { grantCatalog } from "@/constants/grants";
import { Theme } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const featuredGrantTitles = [
  "StrongerBC Future Skills Grant",
  "Youth Work in Trades (WRK) Scholarship",
  "LNG Canada Trades Training Fund",
  "Masonry Institute of BC Training Fund",
  "Soroptimist - Live your dream awards",
  "Women in Skilled Trades Bursary",
  "Indigenous Skills Bridge Fund",
  "Green Building Innovation Grant",
  "Northern Community Relocation Grant",
];

export default function WebOnlyTab() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profileData } = useProfile();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 1440;

  useEffect(() => {
    if (isWideLayout && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen, isWideLayout]);

  const name = profileData.name || "Full Name";

  const applicationGrants = useMemo(
    () =>
      featuredGrantTitles
        .map((title) => grantCatalog.find((grant) => grant.title === title))
        .filter((grant): grant is (typeof grantCatalog)[number] =>
          Boolean(grant)
        ),
    []
  );

  const selectedGrant = useMemo(
    () =>
      applicationGrants.find((grant) => grant.id === selectedApplicationId) ||
      null,
    [applicationGrants, selectedApplicationId]
  );

  const handleSelectApplication = (grantId: string | null) => {
    setSelectedApplicationId(grantId);
    if (!isWideLayout) {
      setIsSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <>
      <View style={styles.profileSection}>
        <Pressable
          onPress={() => handleSelectApplication(null)}
          style={({ pressed }) => [
            styles.profileCircle,
            pressed && styles.profileCirclePressed,
          ]}
        >
          <View style={styles.profileCircleInner} />
        </Pressable>
        <Text style={styles.fullName}>{name}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Your applications</Text>
      <ScrollView
        style={styles.tabsContainer}
        showsVerticalScrollIndicator={false}
      >
        {applicationGrants.map((grant) => (
          <ApplicationTab
            key={grant.id}
            title={grant.title}
            isSelected={selectedApplicationId === grant.id}
            onPress={() => handleSelectApplication(grant.id)}
          />
        ))}
      </ScrollView>
      {/* <LogInButton /> */}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, !isWideLayout && styles.layoutMobile]}>
        {/* Left Sidebar */}
        {isWideLayout ? (
          <View style={styles.sidebar}>{sidebarContent}</View>
        ) : (
          <>
            <View style={styles.mobileHeader}>
              <Pressable
                onPress={() => setIsSidebarOpen(true)}
                style={styles.menuButton}
              >
                <Ionicons name="menu" size={22} color={Theme.colors.black} />
              </Pressable>
              <Text style={styles.headerTitle}>Your applications</Text>
            </View>
            {isSidebarOpen && (
              <Pressable
                style={styles.backdrop}
                onPress={() => setIsSidebarOpen(false)}
              >
                <Pressable
                  style={[styles.sidebar, styles.sidebarDrawer]}
                  onPress={(event) => event.stopPropagation()}
                >
                  {sidebarContent}
                </Pressable>
              </Pressable>
            )}
          </>
        )}

        {/* Right Main Content */}
        <View style={styles.mainContent}>
          {selectedGrant ? (
            <View style={styles.applicationView}>
              <ApplicationTemplet grant={selectedGrant} />
            </View>
          ) : (
            <ImageBackground
              source={require("@/assets/images/web_main_bg.png")}
              style={styles.emptyState}
              resizeMode="cover"
              imageStyle={styles.backgroundImage}
            >
              <View style={styles.characterContainer}>
                <Image
                  source={require("@/assets/images/web_main_icon_white.png")}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.emptyStateText}>
                View Your Generated Applications!
              </Text>
            </ImageBackground>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  layout: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  layoutMobile: {
    flexDirection: "column",
  },
  sidebar: {
    width: 350,
    backgroundColor: Theme.colors.white,
    padding: 24,
    paddingBottom: 0,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.lightGrey,
    flexDirection: "column",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCircleInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.purple,
  },
  profileCirclePressed: {
    opacity: 0.7,
  },
  fullName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 20,
  },
  sectionTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.black,
    marginBottom: 12,
  },
  tabsContainer: {
    flex: 1,
  },
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.lightGrey,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.lightGrey,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
  },
  headerTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.black,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 10,
  },
  sidebarDrawer: {
    width: 320,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 11,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  mainContent: {
    flex: 1,
  },
  applicationView: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
  },
  emptyState: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  characterContainer: {
    marginBottom: 24,
  },
  characterImage: {
    width: 120,
    height: 120,
  },
  emptyStateText: {
    ...Theme.typography.h3,
    color: Theme.colors.white,
    textAlign: "center",
  },
});

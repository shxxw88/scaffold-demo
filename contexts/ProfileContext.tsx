import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ProfileData {
  // Basic Profile
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  profileImageUri: string;
  // Residence
  address: string;
  postalCode: string;
  province: string;
  citizenshipStatus: string;
  // Household (for future use)
  householdSize: string;
  familyComposition: string;
  annualFamilyNetIncome: string;
  // Family/Guardian (for future use)
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  // Education
  highestEducation: string;
  highSchoolName: string;
  graduationDate: string;
  tradeSchoolName: string;
  tradeProgramName: string;
  tradeGraduationDate: string;
  trade: string;
  apprenticeshipLevel: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfileData: (data: Partial<ProfileData>) => void;
  resetProfileData: () => void;
}

const defaultProfileData: ProfileData = {
  name: "Talia Redsky",
  dateOfBirth: "",
  gender: "Female",
  phone: "(205) 923-2406",
  email: "talia_redsky@gmail.com",
  address: "Williams Lake",
  postalCode: "",
  province: "British Columbia",
  citizenshipStatus: "Indigenous Canadian",
  householdSize: "",
  familyComposition: "",
  annualFamilyNetIncome: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  highestEducation: "High School Diploma",
  highSchoolName: "Columneetza Secondary School",
  graduationDate: "2015-06-01",
  tradeSchoolName: "Trowel Trades Training Association",
  tradeProgramName: "Masonry Foundation Program",
  tradeGraduationDate: "2025-06-01",
  trade: "Masonry",
  apprenticeshipLevel: "Level 1",
  profileImageUri: "",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
const STORAGE_KEY = "@profile_data";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
     setIsLoading(false);  //skip loading
  };

  const saveProfileData = async (data: ProfileData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData((prev) => {
      const updated = { ...prev, ...data };
      // Persist on every change so the UI stays in sync with storage.
      saveProfileData(updated);
      return updated;
    });
  };

  const resetProfileData = async () => {
    setProfileData(defaultProfileData);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error resetting profile data:", error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{ profileData, updateProfileData, resetProfileData }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

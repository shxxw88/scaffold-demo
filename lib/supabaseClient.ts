import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Try both Expo-public and generic env names so local/dev setups work.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

// During static export/build, allow missing env vars to prevent build failures
// The actual values will be embedded at build time if available
// If missing, we'll use empty strings which will cause Supabase calls to fail gracefully
// This allows the build to complete and the user can fix env vars for the next build

// Avoid using AsyncStorage when there is no window (SSR/Node) or when running on web,
// otherwise the library throws "window is not defined" during auth bootstrap.
const isServer = typeof window === "undefined";
const isWebClient = !isServer && typeof document !== "undefined";

const authStorage = isServer || isWebClient ? undefined : AsyncStorage;

// Only warn if we're in a runtime environment and values are missing
// During build/static export, missing values are expected if env vars aren't set
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
  auth: {
    storage: authStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});

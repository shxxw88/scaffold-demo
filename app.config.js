import "dotenv/config";
import appJson from "./app.json";

export default ({ config }) => {
  try {
    return {
      ...config,
      ...appJson.expo,
      extra: {
        ...(appJson.expo.extra || {}),
        ...(config.extra || {}),
        openaiApiKey:
          process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
          process.env.OPENAI_API_KEY ||
          appJson.expo.extra?.openaiApiKey ||
          "",
      },
    };
  } catch (error) {
    console.warn("Error loading app config:", error);
    return {
      ...config,
      ...appJson.expo,
    };
  }
};

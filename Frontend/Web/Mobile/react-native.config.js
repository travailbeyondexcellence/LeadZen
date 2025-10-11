module.exports = {
  dependencies: {
    // Disable react-native-sqlite-storage autolinking (use AsyncStorage fallback)
    'react-native-sqlite-storage': {
      platforms: {
        android: null, // Disable Android - use AsyncStorage fallback
        ios: null,     // Disable iOS - use AsyncStorage fallback
      },
    },
  },
};
module.exports = {
  dependencies: {
    // Exclude react-native-sqlite-storage from autolinking
    'react-native-sqlite-storage': {
      platforms: {
        android: null, // Disable Android
        ios: null,     // Disable iOS
      },
    },
  },
};
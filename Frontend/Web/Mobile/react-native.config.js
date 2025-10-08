module.exports = {
  dependencies: {
    'react-native-sqlite-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-sqlite-storage/platforms/android/src/main/java',
          packageImportPath: 'org.pgsqlite.SQLitePluginPackage',
        },
      },
    },
  },
};
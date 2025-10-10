import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppIconProps {
  size?: number;
  showText?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ size = 64, showText = false }) => {
  const iconSize = size;
  const fontSize = size * 0.35;
  const textSize = size * 0.2;

  return (
    <View style={[styles.container, { width: iconSize, height: iconSize }]}>
      <View style={[styles.iconBackground, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.2 }]}>
        <Text style={[styles.iconText, { fontSize }]}>LZ</Text>
        <View style={[styles.accent, { width: iconSize * 0.4, height: iconSize * 0.08, borderRadius: iconSize * 0.04 }]} />
      </View>
      {showText && (
        <Text style={[styles.appText, { fontSize: textSize, marginTop: size * 0.1 }]}>
          LeadZen
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: -4,
  },
  accent: {
    backgroundColor: '#FFD700',
    position: 'absolute',
    bottom: '15%',
  },
  appText: {
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AppIcon;
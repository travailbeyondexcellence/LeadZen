import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_SIZE = 60;
const ICON_SPACING = 16;
const MAX_SCALE = 1.3;
const INFLUENCE_DISTANCE = 100;
const SELECTED_SCALE = 1.15;
const BUMP_OFFSET = -16;

interface DockIconProps {
  iconName: string;
  position: number;
  touchX: number | null;
  isSelected: boolean;
  onSelect: () => void;
  color: string;
}

const DockIcon: React.FC<DockIconProps> = ({ 
  iconName, 
  position, 
  touchX, 
  isSelected, 
  onSelect,
  color 
}) => {
  const scale = useRef(new Animated.Value(isSelected ? SELECTED_SCALE : 1)).current;
  const translateY = useRef(new Animated.Value(isSelected ? BUMP_OFFSET : 0)).current;

  useEffect(() => {
    const baseScale = isSelected ? SELECTED_SCALE : 1;
    const baseTranslateY = isSelected ? BUMP_OFFSET : 0;

    if (touchX === null) {
      // No touch - return to base state
      Animated.parallel([
        Animated.spring(scale, {
          toValue: baseScale,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(translateY, {
          toValue: baseTranslateY,
          useNativeDriver: true,
          friction: 10,
          tension: 50,
        }),
      ]).start();
    } else {
      // Calculate hover effect based on touch proximity
      const iconCenter = position + ICON_SIZE / 2;
      const distance = Math.abs(touchX - iconCenter);

      if (distance > INFLUENCE_DISTANCE) {
        // Too far - return to base state
        Animated.parallel([
          Animated.spring(scale, {
            toValue: baseScale,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          Animated.spring(translateY, {
            toValue: baseTranslateY,
            useNativeDriver: true,
            friction: 10,
            tension: 50,
          }),
        ]).start();
      } else {
        // Apply hover scaling based on distance
        const hoverScale = 1 + (1 - distance / INFLUENCE_DISTANCE) * (MAX_SCALE - 1);
        const finalScale = baseScale * hoverScale;

        Animated.parallel([
          Animated.spring(scale, {
            toValue: finalScale,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }),
          Animated.spring(translateY, {
            toValue: baseTranslateY,
            useNativeDriver: true,
            friction: 10,
            tension: 50,
          }),
        ]).start();
      }
    }
  }, [touchX, position, isSelected, scale, translateY]);

  return (
    <View style={styles.iconContainer}>
      <TouchableOpacity
        onPress={() => {
          console.log('🎯 DockIcon pressed:', iconName);
          onSelect();
        }}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          <View style={[
            styles.iconBackground,
            isSelected && styles.iconBackgroundSelected
          ]}>
            <Icon 
              name={iconName} 
              size={32} 
              color={isSelected ? Colors.primary.base : color} 
            />
          </View>
        </Animated.View>

        {/* Selected indicator dot */}
        {isSelected && (
          <View style={styles.selectedDot} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginHorizontal: ICON_SPACING / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBackgroundSelected: {
    borderColor: 'rgba(20, 184, 166, 0.6)',
    shadowColor: Colors.primary.base,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  selectedDot: {
    position: 'absolute',
    bottom: -16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.base,
    shadowColor: Colors.primary.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default DockIcon;
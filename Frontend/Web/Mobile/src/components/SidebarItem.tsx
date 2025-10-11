import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedValue } from 'react-native-reanimated';
import { SidebarListType } from '../types/sidebar';
import { Colors, Spacing } from '../theme';

interface SidebarItemProps {
  item: SidebarListType;
  active: SharedValue<boolean>;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, active }) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate(item.navigate);
    active.value = false;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Icon name={item.icon} size={24} color={Colors.white} style={styles.icon} />
      <Text style={styles.text}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: Spacing.md,
    width: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default SidebarItem;
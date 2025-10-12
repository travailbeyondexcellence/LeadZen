import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Dimensions,
} from 'react-native';

interface Props {
  onKeyPress: (key: string) => void;
  onLongPress?: (key: string) => void;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');
const KEYPAD_WIDTH = Math.min(width - 32, 320);
const KEY_WIDTH = (KEYPAD_WIDTH - 32) / 3; // 3 keys per row with spacing
const KEY_HEIGHT = 60; // Fixed height for oval shape

const KEYPAD_LAYOUT = [
  [
    { key: '1', subText: '' },
    { key: '2', subText: 'ABC' },
    { key: '3', subText: 'DEF' },
  ],
  [
    { key: '4', subText: 'GHI' },
    { key: '5', subText: 'JKL' },
    { key: '6', subText: 'MNO' },
  ],
  [
    { key: '7', subText: 'PQRS' },
    { key: '8', subText: 'TUV' },
    { key: '9', subText: 'WXYZ' },
  ],
  [
    { key: '*', subText: '' },
    { key: '0', subText: '+' },
    { key: '#', subText: '' },
  ],
];

const DialerKeypad: React.FC<Props> = ({
  onKeyPress,
  onLongPress,
  disabled = false,
}) => {
  
  const handleKeyPress = async (key: string) => {
    if (disabled) return;
    
    // Provide haptic feedback without permission check (vibrate is usually auto-granted)
    try {
      Vibration.vibrate(50);
    } catch (error) {
      console.log('Vibration not available:', error.message);
    }
    
    // Call the callback
    onKeyPress(key);
  };

  const handleLongPress = async (key: string) => {
    if (disabled) return;
    
    // Provide haptic feedback for long press without permission check
    try {
      Vibration.vibrate(100);
    } catch (error) {
      console.log('Vibration not available:', error.message);
    }
    
    // Special handling for certain keys
    if (key === '0' && onLongPress) {
      onLongPress('+'); // Long press 0 adds +
    } else if (onLongPress) {
      onLongPress(key);
    }
  };

  const renderKey = (keyData: { key: string; subText: string }) => {
    const { key, subText } = keyData;
    
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.keyButton,
          disabled && styles.keyButtonDisabled,
        ]}
        onPress={() => handleKeyPress(key)}
        onLongPress={() => handleLongPress(key)}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>
          {key}
        </Text>
        {subText && (
          <Text style={[styles.subText, disabled && styles.subTextDisabled]}>
            {subText}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRow = (row: { key: string; subText: string }[], rowIndex: number) => (
    <View key={rowIndex} style={styles.keypadRow}>
      {row.map(renderKey)}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.keypad}>
        {KEYPAD_LAYOUT.map(renderRow)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  keypad: {
    width: KEYPAD_WIDTH,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyButton: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    borderRadius: 20, // Oval/rounded rectangle shape
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  keyButtonDisabled: {
    backgroundColor: '#F1F3F4',
    opacity: 0.6,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  keyTextDisabled: {
    color: '#999999',
  },
  subText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    marginTop: -1,
    letterSpacing: 0.5,
  },
  subTextDisabled: {
    color: '#BBBBBB',
  },
});

export default DialerKeypad;
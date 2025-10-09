import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

interface UserSettings {
  name: string;
  company: string;
  email: string;
  phone: string;
  autoSave: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    company: '',
    email: '',
    phone: '',
    autoSave: true,
  });
  const [errors, setErrors] = useState<Partial<UserSettings>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserSettings> = {};
    
    if (!settings.name.trim()) newErrors.name = 'Name is required';
    if (settings.email && !/\S+@\S+\.\S+/.test(settings.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      Alert.alert('Success', 'Settings saved successfully!');
      setLoading(false);
    }, 1000);
  };

  const updateSetting = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof Partial<UserSettings>]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <Input
            label="Full Name"
            value={settings.name}
            onChangeText={(value) => updateSetting('name', value)}
            placeholder="Enter your full name"
            error={errors.name}
            required
          />
          
          <Input
            label="Company"
            value={settings.company}
            onChangeText={(value) => updateSetting('company', value)}
            placeholder="Enter your company name"
          />
          
          <Input
            label="Email Address"
            value={settings.email}
            onChangeText={(value) => updateSetting('email', value)}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Phone Number"
            value={settings.phone}
            onChangeText={(value) => updateSetting('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Save Settings"
              onPress={handleSave}
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.primary.base,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.primary,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
  form: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius['2xl'],
    marginVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.card,
    paddingVertical: Spacing.card,
    ...Shadows.medium,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    marginTop: Spacing['2xl'],
  },
});

export default Settings;
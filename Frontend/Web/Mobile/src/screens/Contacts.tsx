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
import { Colors, Typography, Spacing, Shadows } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

interface Lead {
  name: string;
  phone: string;
  email: string;
  company: string;
}

const Contacts: React.FC = () => {
  const [lead, setLead] = useState<Lead>({
    name: '',
    phone: '',
    email: '',
    company: '',
  });
  const [errors, setErrors] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Lead> = {};
    
    if (!lead.name.trim()) newErrors.name = 'Name is required';
    if (!lead.phone.trim()) newErrors.phone = 'Phone is required';
    if (lead.email && !/\S+@\S+\.\S+/.test(lead.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      Alert.alert('Success', 'Lead saved successfully!');
      setLead({ name: '', phone: '', email: '', company: '' });
      setErrors({});
      setLoading(false);
    }, 1000);
  };

  const updateLead = (field: keyof Lead, value: string) => {
    setLead(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Lead</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={lead.name}
            onChangeText={(value) => updateLead('name', value)}
            placeholder="Enter full name"
            error={errors.name}
            required
          />
          
          <Input
            label="Phone Number"
            value={lead.phone}
            onChangeText={(value) => updateLead('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            required
          />
          
          <Input
            label="Email Address"
            value={lead.email}
            onChangeText={(value) => updateLead('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Company"
            value={lead.company}
            onChangeText={(value) => updateLead('company', value)}
            placeholder="Enter company name"
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Save Lead"
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  form: {
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    ...Shadows.level1,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
});

export default Contacts;
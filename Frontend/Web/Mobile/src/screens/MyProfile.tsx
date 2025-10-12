import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

interface UserProfile {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  bio: string;
  avatarUri: string;
  accountCreated: string;
  lastLogin: string;
}

const STORAGE_KEY = '@leadzen_user_profile';

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    bio: '',
    avatarUri: '',
    accountCreated: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserProfile> = {};
    
    if (!profile.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const updatedProfile = {
        ...profile,
        lastLogin: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePicker = () => {
    const options = [
      'Take Photo',
      'Choose from Library',
      'Cancel'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          } else if (buttonIndex === 1) {
            openImageLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Profile Picture',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Library', onPress: openImageLibrary },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 300,
        maxHeight: 300,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          updateProfile('avatarUri', response.assets[0].uri || '');
        }
      }
    );
  };

  const openImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 300,
        maxHeight: 300,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          updateProfile('avatarUri', response.assets[0].uri || '');
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.fullName ? getInitials(profile.fullName) : 'ME'}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change profile picture</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name"
            value={profile.fullName}
            onChangeText={(value) => updateProfile('fullName', value)}
            placeholder="Enter your full name"
            error={errors.fullName}
            required
          />
          
          <Input
            label="Job Title"
            value={profile.jobTitle}
            onChangeText={(value) => updateProfile('jobTitle', value)}
            placeholder="e.g. Sales Manager, CEO"
          />
          
          <Input
            label="Company"
            value={profile.company}
            onChangeText={(value) => updateProfile('company', value)}
            placeholder="Enter your company name"
          />
          
          <Input
            label="Email Address"
            value={profile.email}
            onChangeText={(value) => updateProfile('email', value)}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Phone Number"
            value={profile.phone}
            onChangeText={(value) => updateProfile('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <Input
            label="Bio"
            value={profile.bio}
            onChangeText={(value) => updateProfile('bio', value)}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Icon name="calendar-plus" size={20} color={Colors.primary.base} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Created</Text>
              <Text style={styles.infoValue}>{formatDate(profile.accountCreated)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={20} color={Colors.primary.base} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>{formatDate(profile.lastLogin)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="shield-check" size={20} color={Colors.semantic.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <Text style={[styles.infoValue, { color: Colors.semantic.success }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Profile"
            onPress={handleSave}
            loading={loading}
            fullWidth
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background.secondary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary.base,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.primary,
  },
  avatarHint: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius['2xl'],
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.card,
    paddingVertical: Spacing.card,
    ...Shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: Spacing.sm,
  },
  infoContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
});

export default MyProfile;
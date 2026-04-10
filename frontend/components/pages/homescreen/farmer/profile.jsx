import React, { useContext, useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { AuthContext } from '../../../../App';
import { launchImageLibrary } from 'react-native-image-picker';
import { CompleteFarmerProfil, farmerService } from '../../service/api';

// ─── Replace these with your actual imports ───────────────────────────────────
// import * as ImagePicker from 'expo-image-picker';       // if using Expo
// import { launchImageLibrary } from 'react-native-image-picker'; // if using bare RN
// import storage from '@react-native-firebase/storage';  // Firebase Storage
// import firestore from '@react-native-firebase/firestore'; // Firestore
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const authContext = useContext(AuthContext);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await farmerService.getProfile();
                if (response.success && response.data) {
                    const data = response.data;
                    setProfileData({
                        name: data.name || '',
                        phone: data.phone || '',
                        village: data.village || '',
                        district: data.district || '',
                        state: data.state || '',
                        landArea: data.landArea || '',
                        cropTypes: data.crops ? data.crops.join(', ') : '', // Map array back to string
                        aadhaar: data.aadhaar || '',
                    });
                    // This is the Cloudinary URL from your DB:
                    if (data.profilePhoto) setProfileImage(data.profilePhoto);
                }
            } catch (error) {
                console.log("Error fetching profile", error);
            }
        };
        fetchProfile();
    }, []);


    // ── Profile data state ─────────────────────────────────────────────────
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        village: '',
        district: '',
        state: '',
        landArea: '',
        cropTypes: '',
        aadhaar: '',
    });

    const [profileImage, setProfileImage] = useState(null); // URI string
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // ── Derived: check if profile is complete ──────────────────────────────
    const isProfileComplete = profileData.name && profileData.phone && profileData.village;

    // ── Handle picking profile image ───────────────────────────────────────
    const handlePickImage = async () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
            if (!response.didCancel && response.assets?.[0]) {
                // This is crucial: it sets the local URI for preview and upload
                setProfileImage(response.assets[0].uri);
            }
        });
    };

    const handleSaveProfile = async () => {
    if (!profileData.name.trim() || !profileData.phone.trim()) {
        Alert.alert('Required Fields', 'Please fill in name and phone.');
        return;
    }

    try {
        setUploading(true);

        // 1. Upload Photo if selected
        if (profileImage && !profileImage.startsWith('http')) {
            const uploadRes = await farmerService.uploadProfilePhoto(profileImage);
            console.log("Upload response", uploadRes.profileData.profilePhoto);
            setProfileImage(uploadRes.profileData.profilePhoto);
        }

        // 2. Prepare data (map cropTypes to crops as expected by backend)
        const dataToSave = {
            ...profileData,
            crops: profileData.cropTypes.split(',').map(crop => crop.trim()) // Backend expects 'crops'
        };

        // 3. Save Profile Data
        await CompleteFarmerProfile(dataToSave);

        Alert.alert('Success', 'Profile updated successfully!');
        setModalVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setUploading(false);
        }
    };


    /* const handleSaveProfile = async () => {
        if (!profileData.name.trim() || !profileData.phone.trim()) {
            Alert.alert('Required Fields', 'Please fill in your name and phone number.');
            return;
        }

        try {
            setUploading(true);
            const userId = authContext?.user?.uid || 'demo_user';

            let imageUrl = null;
            if (profileImage) {
                imageUrl = await uploadImageToStorage(profileImage, userId);
            }

            const dataToSave = {
                ...profileData,
                profileImage: imageUrl,
                updatedAt: new Date().toISOString(),
                userId,
            };

            // ── Save to Firestore ──────────────────────────────────────
            // await firestore().collection('farmers').doc(userId).set(dataToSave, { merge: true });

            console.log('Saving to database:', dataToSave);

            Alert.alert('Profile Saved!', 'Your profile has been saved successfully.', [
                { text: 'OK', onPress: () => setModalVisible(false) },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }; */

    const updateField = (field, value) => setProfileData(prev => ({ ...prev, [field]: value }));

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Profile" />

                {/* ── Main Screen ─────────────────────────────────────── */}
                <View className="flex-1 bg-[#f8fafc]">

                    {/* Logout button — top right */}
                    <View className="items-end px-4 pt-3">
                        <TouchableOpacity
                            className="bg-red-600 px-4 py-2 rounded-full"
                            onPress={() =>
                                Alert.alert('Logout', 'Are you sure you want to logout?', [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Logout', style: 'destructive', onPress: () => authContext?.logout() },
                                ])
                            }
                        >
                            <Text className="text-white font-bold text-sm">Logout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Profile card */}
                    <View className="flex-1 justify-center items-center px-6">
                        <View className="bg-white rounded-3xl p-8 w-full items-center shadow-sm border border-gray-100">

                            {/* Avatar */}
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="relative mb-4"
                            >
                                {profileImage ? (
                                    <Image
                                        source={{ uri: profileImage }}
                                        className="w-24 h-24 rounded-full"
                                    />
                                ) : (
                                    <View className="w-24 h-24 rounded-full bg-[#e8f5ee] items-center justify-center border-2 border-dashed border-[#1e4a3b]">
                                        <Text className="text-3xl">👤</Text>
                                    </View>
                                )}
                                <View className="absolute bottom-0 right-0 bg-[#1e4a3b] rounded-full w-7 h-7 items-center justify-center">
                                    <Text className="text-white text-xs font-bold">+</Text>
                                </View>
                            </TouchableOpacity>

                            <Text className="text-2xl font-bold text-[#1e4a3b] mb-1">
                                {profileData.name || 'Your Name'}
                            </Text>
                            <Text className="text-gray-400 text-sm mb-2">
                                {profileData.village
                                    ? `${profileData.village}, ${profileData.district}`
                                    : 'Complete your profile'}
                            </Text>

                            {/* Completion badge */}
                            {!isProfileComplete && (
                                <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-6 w-full">
                                    <Text className="text-amber-700 text-xs text-center">
                                        ⚠️  Your profile is incomplete. Complete it to get personalised crop advice.
                                    </Text>
                                </View>
                            )}

                            {isProfileComplete && (
                                <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-6 w-full">
                                    <Text className="text-green-700 text-xs text-center">
                                        ✅  Profile complete!
                                    </Text>
                                </View>
                            )}

                            {/* Quick info rows */}
                            {profileData.phone ? (
                                <View className="w-full flex-row justify-between py-2 border-b border-gray-100">
                                    <Text className="text-gray-400 text-sm">Phone</Text>
                                    <Text className="text-[#1e4a3b] text-sm font-medium">{profileData.phone}</Text>
                                </View>
                            ) : null}
                            {profileData.landArea ? (
                                <View className="w-full flex-row justify-between py-2 border-b border-gray-100">
                                    <Text className="text-gray-400 text-sm">Land Area</Text>
                                    <Text className="text-[#1e4a3b] text-sm font-medium">{profileData.landArea} acres</Text>
                                </View>
                            ) : null}
                            {profileData.cropTypes ? (
                                <View className="w-full flex-row justify-between py-2">
                                    <Text className="text-gray-400 text-sm">Crops</Text>
                                    <Text className="text-[#1e4a3b] text-sm font-medium">{profileData.cropTypes}</Text>
                                </View>
                            ) : null}

                            {/* Complete / Edit profile button */}
                            <TouchableOpacity
                                className="bg-[#1e4a3b] mt-6 py-4 rounded-2xl w-full items-center"
                                onPress={() => setModalVisible(true)}
                            >
                                <Text className="text-white font-bold text-base">
                                    {isProfileComplete ? '✏️  Edit Profile' : '📋  Complete Profile'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* ── Profile Completion Modal ─────────────────────────────────── */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>

                            {/* Modal Header */}
                            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                                <Text className="text-lg font-bold text-[#1e4a3b]">Complete Your Profile</Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                                >
                                    <Text className="text-gray-600 font-bold text-base">×</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                className="px-6 py-4"
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >

                                {/* Profile picture row */}
                                <View className="items-center mb-6">
                                    <TouchableOpacity onPress={handlePickImage} className="relative">
                                        {profileImage ? (
                                            <Image
                                                source={{ uri: profileImage }}
                                                className="w-20 h-20 rounded-full"
                                            />
                                        ) : (
                                            <View className="w-20 h-20 rounded-full bg-[#e8f5ee] items-center justify-center border-2 border-dashed border-[#1e4a3b]">
                                                <Text className="text-2xl">📷</Text>
                                            </View>
                                        )}
                                        <View className="absolute bottom-0 right-0 bg-[#1e4a3b] rounded-full w-6 h-6 items-center justify-center">
                                            <Text className="text-white text-xs font-bold">+</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <Text className="text-xs text-gray-400 mt-2">Tap to upload photo</Text>
                                </View>

                                {/* ── Section: Personal Info ─────────────────────── */}
                                <SectionLabel title="Personal Information" />

                                <InputField
                                    label="Full Name *"
                                    placeholder="e.g. Ramesh Patel"
                                    value={profileData.name}
                                    onChangeText={v => updateField('name', v)}
                                />
                                <InputField
                                    label="Phone Number *"
                                    placeholder="e.g. 9876543210"
                                    value={profileData.phone}
                                    onChangeText={v => updateField('phone', v)}
                                    keyboardType="phone-pad"
                                />
                                <InputField
                                    label="Aadhaar Number"
                                    placeholder="12-digit Aadhaar"
                                    value={profileData.aadhaar}
                                    onChangeText={v => updateField('aadhaar', v)}
                                    keyboardType="numeric"
                                    maxLength={12}
                                />

                                {/* ── Section: Location ─────────────────────────── */}
                                <SectionLabel title="Location" />

                                <InputField
                                    label="Village / Town *"
                                    placeholder="e.g. Dharampur"
                                    value={profileData.village}
                                    onChangeText={v => updateField('village', v)}
                                />
                                <InputField
                                    label="District"
                                    placeholder="e.g. Valsad"
                                    value={profileData.district}
                                    onChangeText={v => updateField('district', v)}
                                />
                                <InputField
                                    label="State"
                                    placeholder="e.g. Gujarat"
                                    value={profileData.state}
                                    onChangeText={v => updateField('state', v)}
                                />

                                {/* ── Section: Farm Details ──────────────────────── */}
                                <SectionLabel title="Farm Details" />

                                <InputField
                                    label="Total Land Area (acres)"
                                    placeholder="e.g. 3.5"
                                    value={profileData.landArea}
                                    onChangeText={v => updateField('landArea', v)}
                                    keyboardType="decimal-pad"
                                />
                                <InputField
                                    label="Primary Crops"
                                    placeholder="e.g. Wheat, Cotton, Sugarcane"
                                    value={profileData.cropTypes}
                                    onChangeText={v => updateField('cropTypes', v)}
                                />

                                {/* Upload progress */}
                                {uploading && uploadProgress > 0 && (
                                    <View className="mb-4">
                                        <Text className="text-xs text-gray-400 mb-1">
                                            Uploading photo... {uploadProgress}%
                                        </Text>
                                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <View
                                                className="h-2 bg-[#1e4a3b] rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Save button */}
                                <TouchableOpacity
                                    className={`py-4 rounded-2xl items-center mb-8 ${uploading ? 'bg-gray-300' : 'bg-[#1e4a3b]'}`}
                                    onPress={handleSaveProfile}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text className="text-white font-bold text-base">
                                            💾  Save Profile
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

// ── Helper Components ───────────────────────────────────────────────────────

function SectionLabel({ title }) {
    return (
        <View className="flex-row items-center mb-3 mt-2">
            <Text className="text-xs font-bold text-[#1e4a3b] uppercase tracking-widest">{title}</Text>
            <View className="flex-1 h-px bg-gray-200 ml-2" />
        </View>
    );
}

function InputField({ label, placeholder, value, onChangeText, keyboardType, maxLength }) {
    return (
        <View className="mb-4">
            <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType || 'default'}
                maxLength={maxLength}
            />
        </View>
    );
}
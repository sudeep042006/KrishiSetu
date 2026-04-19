import React, { useContext, useState, useEffect } from 'react';
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
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/BHeader';
import { AuthContext } from '../../../../App';
import { launchImageLibrary } from 'react-native-image-picker';
import { offtakerService } from '../../service/api';
import { 
    User, 
    Briefcase, 
    Building2, 
    Globe, 
    Phone, 
    Mail, 
    MapPin, 
    Scale, 
    FileText, 
    Package, 
    CreditCard,
    PlusCircle,
    X
} from 'lucide-react-native';

export default function OfftakerProfileScreen() {
    const authContext = useContext(AuthContext);
    
    const [profileData, setProfileData] = useState({
        companyName: '',
        businessType: 'wholesaler',
        industryCategory: '',
        contactPersonName: '',
        designation: '',
        companyEmail: '',
        companyPhone: '',
        website: '',
        companyDescription: '',
        gstNumber: '',
        registrationNumber: '',
        panNumber: '',
        headquarters: {
            city: '',
            state: '',
            addressLine1: ''
        },
        preferredCrops: [],
        procurementCapacity: '',
        procurementUnit: 'ton'
    });

    const [profileImage, setProfileImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await offtakerService.getProfile();
            if (response.success && response.data) {
                setProfileData(response.data);
                if (response.data.profilePhoto) {
                    setProfileImage(response.data.profilePhoto);
                }
            }
        } catch (error) {
            console.log("Error fetching offtaker profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async (response) => {
            if (!response.didCancel && response.assets?.[0]) {
                const uri = response.assets[0].uri;
                setProfileImage(uri);
                try {
                    await offtakerService.uploadPhoto(uri);
                    Alert.alert('Success', 'Profile photo updated');
                } catch (error) {
                    Alert.alert('Upload Failed', 'Could not upload photo at this time.');
                }
            }
        });
    };

    const handleSaveProfile = async () => {
        if (!profileData.companyName || !profileData.companyPhone) {
            Alert.alert('Incomplete Info', 'Please provide Company Name and Phone.');
            return;
        }

        try {
            setSaving(true);
            const response = await offtakerService.updateProfile(profileData);
            if (response.success) {
                Alert.alert('Success', 'Business profile updated successfully!');
                setModalVisible(false);
                setProfileData(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update business profile.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent, field, value) => {
        setProfileData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#14243eff] justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#14243eff]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Business Profile" />

                <ScrollView className="flex-1 bg-[#f8fafc] rounded-t-[40px]" showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View className="items-center py-8">
                        <TouchableOpacity onPress={handlePickImage} className="relative">
                            <View className="w-28 h-28 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden justify-center items-center">
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} className="w-full h-full" />
                                ) : (
                                    <Building2 size={48} color="#94a3b8" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 bg-[#3b82f6] rounded-full p-2 border-2 border-white">
                                <PlusCircle size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        <Text className="text-2xl font-black text-slate-900 mt-4 text-center px-6">
                            {profileData.companyName || 'Set Company Name'}
                        </Text>
                        <View className="flex-row items-center mt-1 bg-blue-50 px-3 py-1 rounded-full">
                            <Briefcase size={12} color="#3b82f6" />
                            <Text className="text-[#3b82f6] text-[10px] font-bold uppercase ml-1 tracking-wider">
                                {profileData.businessType}
                            </Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row justify-around px-6 mb-8 mt-2">
                        <View className="items-center">
                            <Text className="text-slate-900 font-black text-lg">{profileData.preferredCrops?.length || 0}</Text>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold">Crops</Text>
                        </View>
                        <View className="w-px h-10 bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-slate-900 font-black text-lg">{profileData.procurementCapacity || '0'}</Text>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold">Cap ({profileData.procurementUnit})</Text>
                        </View>
                        <View className="w-px h-10 bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-emerald-500 font-black text-lg">Active</Text>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold">Status</Text>
                        </View>
                    </View>

                    <View className="px-6 mb-10">
                        {/* Summary Cards */}
                        <InfoSection title="Contact Individual">
                            <DetailRow icon={User} label="Person" value={profileData.contactPersonName || 'Not Set'} />
                            <DetailRow icon={Target} label="Role" value={profileData.designation || 'Not Set'} />
                            <DetailRow icon={Phone} label="Phone" value={profileData.companyPhone} />
                        </InfoSection>

                        <InfoSection title="Business Entities">
                            <DetailRow icon={FileText} label="GSTIN" value={profileData.gstNumber} />
                            <DetailRow icon={CreditCard} label="PAN" value={profileData.panNumber} />
                            <DetailRow icon={Globe} label="Website" value={profileData.website} />
                        </InfoSection>

                        <InfoSection title="Headquarters">
                            <DetailRow icon={MapPin} label="Location" value={`${profileData.headquarters?.city}, ${profileData.headquarters?.state}`} />
                        </InfoSection>

                        {/* Action Buttons */}
                        <TouchableOpacity 
                            onPress={() => setModalVisible(true)}
                            className="bg-[#1e4e8c] py-4 rounded-3xl items-center shadow-lg shadow-blue-900/30 mt-6"
                        >
                            <Text className="text-white font-bold text-base">Complete Business Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => authContext?.logout()}
                            className="bg-white border border-red-100 py-4 rounded-3xl items-center mt-4"
                        >
                            <Text className="text-red-600 font-bold text-base">Logout from Portal</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Editing Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-end">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View className="bg-white rounded-t-[40px] h-[90%] overflow-hidden">
                            <View className="flex-row justify-between items-center px-8 py-6 border-b border-slate-50">
                                <Text className="text-xl font-black text-slate-900">Business Details</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                                    <X size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="px-8 pt-4 pb-10" showsVerticalScrollIndicator={false}>
                                <FormLabel label="Personal Context" />
                                <InputField label="Your Name" placeholder="e.g. Aman Gupta" value={profileData.contactPersonName} onChangeText={v => updateField('contactPersonName', v)} />
                                <InputField label="Designation" placeholder="e.g. Managing Director" value={profileData.designation} onChangeText={v => updateField('designation', v)} />
                                
                                <FormLabel label="Company Profile" />
                                <InputField label="Legal Company Name" placeholder="e.g. Krish Exports Ltd." value={profileData.companyName} onChangeText={v => updateField('companyName', v)} />
                                <InputField label="Industry" placeholder="e.g. Food Tech, Supply Chain" value={profileData.industryCategory} onChangeText={v => updateField('industryCategory', v)} />
                                <InputField label="Company Website" placeholder="https://..." value={profileData.website} onChangeText={v => updateField('website', v)} />
                                <InputField label="Work Phone / Whatsapp" placeholder="+91..." value={profileData.companyPhone} onChangeText={v => updateField('companyPhone', v)} keyboardType="phone-pad" />
                                
                                <FormLabel label="Tax & Registration" />
                                <InputField label="GST Number" placeholder="22AAAAA0000A1Z5" value={profileData.gstNumber} onChangeText={v => updateField('gstNumber', v.toUpperCase())} maxLength={15} />
                                <InputField label="Business PAN" placeholder="ABCDE1234F" value={profileData.panNumber} onChangeText={v => updateField('panNumber', v.toUpperCase())} maxLength={10} />

                                <FormLabel label="Location" />
                                <InputField label="Headquarters City" placeholder="e.g. Pune" value={profileData.headquarters?.city} onChangeText={v => updateNestedField('headquarters', 'city', v)} />
                                <InputField label="State" placeholder="e.g. Maharashtra" value={profileData.headquarters?.state} onChangeText={v => updateNestedField('headquarters', 'state', v)} />

                                <FormLabel label="Procurement Specs" />
                                <InputField label="Capacity Quantity" placeholder="e.g. 500" value={profileData.procurementCapacity?.toString()} onChangeText={v => updateField('procurementCapacity', v)} keyboardType="numeric" />
                                <InputField label="Unit (ton, kg, qtl)" placeholder="ton" value={profileData.procurementUnit} onChangeText={v => updateField('procurementUnit', v)} />

                                <TouchableOpacity 
                                    className={`py-5 rounded-3xl items-center mt-8 mb-12 ${saving ? 'bg-slate-300' : 'bg-[#1e4e8c]'}`}
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Save Business Profile</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const InfoSection = ({ title, children }) => (
    <View className="bg-white rounded-[32px] p-5 mb-5 shadow-sm border border-slate-50">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</Text>
        {children}
    </View>
);

const DetailRow = ({ icon: Icon, label, value }) => (
    <View className="flex-row items-center justify-between mb-4 last:mb-0">
        <View className="flex-row items-center" style={{ gap: 10 }}>
            <View className="bg-slate-50 p-2 rounded-lg">
                <Icon size={14} color="#64748b" />
            </View>
            <Text className="text-slate-500 text-xs font-medium">{label}</Text>
        </View>
        <Text className="text-slate-900 text-xs font-bold">{value || '---'}</Text>
    </View>
);

const FormLabel = ({ label }) => (
    <View className="flex-row items-center mt-6 mb-3">
        <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{label}</Text>
        <View className="flex-1 h-px bg-slate-100 ml-3" />
    </View>
);

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, maxLength }) => (
    <View className="mb-4">
        <Text className="text-xs font-bold text-slate-500 mb-2">{label}</Text>
        <TextInput
            className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900"
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength}
        />
    </View>
);

function Target({ size, color }) {
    return <Scale size={size} color={color} />; // Proxying for Role/Scaling indicator
}
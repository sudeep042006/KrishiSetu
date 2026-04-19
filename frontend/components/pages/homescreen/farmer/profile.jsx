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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Camera,
    Phone,
    Mail,
    MapPin,
    Sprout,
    Briefcase,
    IdCard,
    ChevronRight,
    Map as MapIcon,
    History,
    CheckCircle2,
    Calendar,
    Settings,
    Leaf,
    LogOut,
} from 'lucide-react-native';
import { AuthContext } from '../../../../App';
import { launchImageLibrary } from 'react-native-image-picker';
import { CompleteFarmerProfile, farmerService } from '../../service/api';
import Header from '../../../common/Header';
import { useNavigation } from '@react-navigation/native';

// ─── Colour tokens (matching Home.jsx / Weather.jsx dark green palette) ─────
const C = {
    bg: '#011a03',
    header: '#022c22',
    card: '#ffffff',
    accent: '#10b981',
    accentSoft: '#d1fae5',
    textPrimary: '#022c22',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    surface: '#f5f9f6',
};

export default function ProfileScreen() {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: '',
        village: '',
        district: '',
        state: '',
        landArea: '',
        cropTypes: '',
        aadhaar: '',
        latitude: 19.2183,
        longitude: 74.7378,
    });

    const [profileImage, setProfileImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await farmerService.getProfile();
            if (res.success && res.data) {
                const d = res.data;
                setProfileData(prev => ({
                    ...prev,
                    name: d.name || '',
                    phone: d.phone || '',
                    email: d.email || '',
                    village: d.village || '',
                    district: d.district || '',
                    state: d.state || '',
                    landArea: d.landArea || '',
                    cropTypes: d.crops ? d.crops.join(', ') : '',
                    aadhaar: d.aadhaar || '',
                    latitude: d.latitude || 19.2183,
                    longitude: d.longitude || 74.7378,
                }));
                if (d.profilePhoto) setProfileImage(d.profilePhoto);
            }
        } catch (e) {
            console.log('Profile fetch error:', e);
        }
    };

    const handlePickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
            if (!res.didCancel && res.assets?.[0]) {
                setProfileImage(res.assets[0].uri);
            }
        });
    };

    const handleSaveProfile = async () => {
        if (!profileData.name.trim() || !profileData.phone.trim()) {
            Alert.alert('Required', 'Please fill in your name and phone number.');
            return;
        }
        try {
            setUploading(true);
            const payload = {
                ...profileData,
                crops: profileData.cropTypes.split(',').map(c => c.trim()).filter(Boolean),
            };
            await CompleteFarmerProfile(payload);
            if (profileImage && !profileImage.startsWith('http')) {
                const uploadRes = await farmerService.uploadProfilePhoto(profileImage);
                setProfileImage(uploadRes.profilePhoto);
            }
            Alert.alert('Success', 'Profile saved successfully!');
            setModalVisible(false);
            fetchProfile();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save profile. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const updateField = (field, value) =>
        setProfileData(prev => ({ ...prev, [field]: value }));

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => authContext?.logout(),
            },
        ]);
    };

    const isComplete = !!(profileData.name && profileData.phone && profileData.village);
    const farmerId = `KS${profileData.phone?.slice(-9) || '123456789'}`;
    const locationLine = profileData.village
        ? `Village ${profileData.village}, Dist. ${profileData.district}, ${profileData.state}`
        : 'Tap "Edit Profile" to add address';

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <Header
                    title="Farmer Profile"
                    rightIcon={
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            style={styles.editBtn}
                        >
                            <Settings size={14} color={C.accent} />
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                    }
                />

                {/* ── Scrollable Body ─────────────────────────────────────── */}
                <ScrollView
                    style={styles.scrollArea}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* ─ Profile identity card ─ */}
                    <View style={styles.identityCard}>
                        {/* Avatar with camera overlay */}
                        <TouchableOpacity onPress={handlePickImage} style={{ position: 'relative', marginRight: 16 }}>
                            <View style={styles.avatar}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={{ fontSize: 36 }}>👨‍🌾</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cameraOverlay}>
                                <Camera size={12} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.farmerName}>
                                {profileData.name || 'Set your name'}
                            </Text>

                            <InfoRow icon={<Phone size={13} color={C.accent} />} text={`+91 ${profileData.phone || 'Not set'}`} />
                            {!!profileData.email && (
                                <InfoRow icon={<Mail size={13} color={C.accent} />} text={profileData.email} />
                            )}
                            <InfoRow icon={<MapPin size={13} color={C.accent} />} text={locationLine} multiline />
                        </View>
                    </View>

                    {/* Profile complete badge */}
                    <View style={[styles.badge, { backgroundColor: isComplete ? '#d1fae5' : '#fef3c7' }]}>
                        <CheckCircle2 size={14} color={isComplete ? '#059669' : '#d97706'} />
                        <Text style={[styles.badgeText, { color: isComplete ? '#065f46' : '#92400e' }]}>
                            {isComplete ? 'Profile Complete' : 'Profile Incomplete — fill in your details'}
                        </Text>
                    </View>

                    {/* ─ Farming Overview ─ */}
                    <SectionTitle icon={<Leaf size={16} color={C.accent} />} title="Farming Overview" />
                    <View style={styles.overviewGrid}>
                        <OverviewCard emoji="🌾" label="Total Land" value={profileData.landArea || '—'} sub="Hectares" bg="#f0fdf4" />
                        <OverviewCard emoji="🌱" label="Main Crops" value={profileData.cropTypes || '—'} sub="" bg="#eff6ff" />
                        <OverviewCard emoji="📅" label="Experience" value="12 Years" sub="" bg="#fffbeb" />
                        <OverviewCard emoji="🪪" label="Farmer ID" value={farmerId} sub="" bg="#f5f3ff" />
                    </View>

                    {/* ─ Land Details ─ */}
                    <View style={styles.rowBetween}>
                        <SectionTitle icon={<MapIcon size={16} color={C.accent} />} title="Land Details" inline />
                        <TouchableOpacity
                            onPress={() => navigation.navigate('LandDetails', { profileData })}
                            style={styles.viewAllBtn}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <ChevronRight size={15} color={C.accent} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('LandDetails', { profileData })}
                        activeOpacity={0.85}
                        style={styles.landCard}
                    >
                        <View style={styles.landCardIcon}>
                            <Text style={{ fontSize: 28 }}>🗺️</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.landCardTitle}>Main Field</Text>
                            <Text style={styles.landCardSub}>{profileData.landArea || '0.0'} Hectares</Text>
                            <Text style={styles.landCardTag}>Irrigated • Owned</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.soilLabel}>Soil Type</Text>
                            <Text style={styles.soilValue}>Black Soil</Text>
                        </View>
                    </TouchableOpacity>

                    {/* ─ Recent Activity ─ */}
                    <SectionTitle icon={<History size={16} color={C.accent} />} title="Recent Activity" />
                    <View style={{ paddingHorizontal: 16, gap: 8 }}>
                        <ActivityRow
                            icon="🌿" iconBg="#d1fae5"
                            title="Profile Updated"
                            subtitle="Phone number and land details updated"
                            time="2 days ago"
                        />
                        <ActivityRow
                            icon="👤" iconBg="#dbeafe"
                            title="Joined KrishiSetu"
                            subtitle="Welcome to the digital agri marketplace"
                            time="15 days ago"
                        />
                    </View>

                    {/* ─ Logout button ─ */}
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <LogOut size={18} color="#dc2626" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>

            {/* ── Edit Profile Modal ──────────────────────────────────── */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.modalSheet}>
                            <View style={styles.sheetHandle} />

                            <View style={styles.sheetHeader}>
                                <View>
                                    <Text style={styles.sheetTitle}>Edit Profile</Text>
                                    <Text style={styles.sheetSubtitle}>Manage your details and farming information</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeBtn}
                                >
                                    <Text style={{ fontSize: 16, color: C.textSecondary, fontWeight: '700' }}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 24 }}>
                                <FormSection title="Personal Information">
                                    <FormInput label="Full Name" placeholder="e.g. Ramesh Chandra" value={profileData.name} onChangeText={v => updateField('name', v)} />
                                    <FormInput label="Phone Number" placeholder="e.g. 98765 43210" value={profileData.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" />
                                    <FormInput label="Aadhaar Number" placeholder="12-digit Aadhaar" value={profileData.aadhaar} onChangeText={v => updateField('aadhaar', v)} keyboardType="numeric" maxLength={12} />
                                </FormSection>

                                <FormSection title="Location & Address">
                                    <FormInput label="Village / Town" placeholder="e.g. Village Rampur" value={profileData.village} onChangeText={v => updateField('village', v)} />
                                    <FormInput label="District" placeholder="e.g. Rewa" value={profileData.district} onChangeText={v => updateField('district', v)} />
                                    <FormInput label="State" placeholder="e.g. Madhya Pradesh" value={profileData.state} onChangeText={v => updateField('state', v)} />
                                </FormSection>

                                <FormSection title="Farm Details">
                                    <FormInput label="Land Area (Hectares)" placeholder="e.g. 1.80" value={profileData.landArea} onChangeText={v => updateField('landArea', v)} keyboardType="decimal-pad" />
                                    <FormInput label="Crops Grown" placeholder="e.g. Wheat, Soybean, Chana" value={profileData.cropTypes} onChangeText={v => updateField('cropTypes', v)} />
                                </FormSection>

                                <TouchableOpacity
                                    onPress={handleSaveProfile}
                                    disabled={uploading}
                                    style={[styles.saveBtn, uploading && { backgroundColor: C.textMuted }]}
                                >
                                    {uploading
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.saveBtnText}>Save Changes</Text>
                                    }
                                </TouchableOpacity>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function InfoRow({ icon, text, multiline = false }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', marginTop: 5, gap: 6 }}>
            <View style={{ marginTop: multiline ? 2 : 0 }}>{icon}</View>
            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500', flex: 1, lineHeight: 18 }} numberOfLines={multiline ? 2 : 1}>
                {text}
            </Text>
        </View>
    );
}

function SectionTitle({ icon, title, inline = false }) {
    if (inline) return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {icon}
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>{title}</Text>
        </View>
    );
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 10, gap: 8 }}>
            {icon}
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>{title}</Text>
        </View>
    );
}

function OverviewCard({ emoji, bg, label, value, sub }) {
    return (
        <View style={[styles.overviewCard, { backgroundColor: bg }]}>
            <Text style={{ fontSize: 26, marginBottom: 8 }}>{emoji}</Text>
            <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPrimary }}>{value}</Text>
            {!!sub && <Text style={{ fontSize: 11, color: C.textMuted }}>{sub}</Text>}
        </View>
    );
}

function ActivityRow({ icon, iconBg, title, subtitle, time }) {
    return (
        <View style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>{title}</Text>
                <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.textMuted }}>{time}</Text>
        </View>
    );
}

function FormSection({ title, children }) {
    return (
        <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {title}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb', marginLeft: 10 }} />
            </View>
            {children}
        </View>
    );
}

function FormInput({ label, placeholder, value, onChangeText, keyboardType, maxLength }) {
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 6 }}>{label}</Text>
            <TextInput
                style={styles.input}
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

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = {
    scrollArea: {
        flex: 1,
        backgroundColor: C.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: C.accent,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
    },
    editBtnText: {
        color: C.accent,
        fontWeight: '700',
        fontSize: 12,
    },
    identityCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 20,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: C.border,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#d1fae5',
        overflow: 'hidden',
        borderWidth: 2.5,
        borderColor: C.accent,
    },
    avatarPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: C.header,
        borderRadius: 10,
        padding: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    farmerName: {
        fontSize: 18,
        fontWeight: '800',
        color: C.textPrimary,
        marginBottom: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: -4,
        marginBottom: 4,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 10,
    },
    overviewCard: {
        borderRadius: 16,
        padding: 14,
        width: '47%',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    viewAllText: {
        color: C.accent,
        fontWeight: '700',
        fontSize: 13,
    },
    landCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    landCardIcon: {
        backgroundColor: '#dcfce7',
        borderRadius: 12,
        padding: 10,
        marginRight: 14,
    },
    landCardTitle: { fontSize: 15, fontWeight: '800', color: C.textPrimary },
    landCardSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
    landCardTag: { fontSize: 11, color: C.textMuted, marginTop: 2 },
    soilLabel: { fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
    soilValue: { fontSize: 14, fontWeight: '800', color: C.textPrimary, marginTop: 2 },
    activityRow: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 8,
    },
    activityIcon: {
        borderRadius: 20,
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#fee2e2',
        gap: 8,
    },
    logoutText: {
        color: '#dc2626',
        fontWeight: '800',
        fontSize: 15,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '92%',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 8,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: C.textPrimary,
    },
    sheetSubtitle: {
        fontSize: 13,
        color: C.textSecondary,
        marginTop: 2,
    },
    closeBtn: {
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 12,
    },
    saveBtn: {
        backgroundColor: C.header,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: C.textPrimary,
        fontWeight: '500',
    },
};
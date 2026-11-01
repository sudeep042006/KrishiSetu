import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { 
    Camera, 
    ImageIcon, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    ShieldAlert, 
    RefreshCw, 
    Leaf,
    FlaskConical,
    ShieldCheck,
    HelpCircle
} from 'lucide-react-native';
import Header from '../../../common/Header';
import { farmerService } from '../../service/api';

const { width } = Dimensions.get('window');

export default function CropDiseaseScreen() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('organic'); // 'organic' | 'chemical' | 'prevention'

    const handleCamera = () => {
        launchCamera({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (!res.didCancel && res.assets?.[0]?.uri) {
                setSelectedImage(res.assets[0].uri);
                setResult(null);
            }
        });
    };

    const handleGallery = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (!res.didCancel && res.assets?.[0]?.uri) {
                setSelectedImage(res.assets[0].uri);
                setResult(null);
            }
        });
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please capture or select a leaf photo first.');
            return;
        }

        try {
            setAnalyzing(true);
            const data = await farmerService.detectCropDisease(selectedImage);
            if (data && data.success) {
                setResult(data);
                if (data.prediction?.is_healthy) {
                    setActiveTab('prevention');
                } else {
                    setActiveTab('organic');
                }
            } else {
                Alert.alert('Analysis Failed', data?.message || 'Could not analyze leaf.');
            }
        } catch (error) {
            console.error('Disease scan error:', error);
            Alert.alert('Error', error.message || 'Could not connect to crop doctor service.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setResult(null);
        setActiveTab('organic');
    };

    const prediction = result?.prediction;
    const advisory = result?.advisory;

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="AI Crop Doctor" showNotification={false} />

                <View className="flex-1 bg-[#f8fafc] rounded-t-[36px] overflow-hidden">
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    >
                        {/* Title & Info Banner */}
                        <View className="flex-row items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-5">
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-10 h-10 rounded-xl bg-emerald-600 items-center justify-center mr-3">
                                    <Sparkles size={20} color="#ffffff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-emerald-950 font-bold text-base">Instant Leaf Diagnosis</Text>
                                    <Text className="text-emerald-700 text-xs mt-0.5">
                                        Scan plant leaves to detect diseases, blights, and receive curative treatments.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Image Preview or Picker */}
                        {selectedImage ? (
                            <View className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm mb-5">
                                <Image 
                                    source={{ uri: selectedImage }} 
                                    style={{ width: '100%', height: 260, borderRadius: 20 }}
                                    resizeMode="cover"
                                />
                                <View className="flex-row justify-between items-center mt-3 px-1">
                                    <TouchableOpacity 
                                        onPress={handleReset} 
                                        className="flex-row items-center py-2 px-3 bg-gray-100 rounded-xl"
                                        disabled={analyzing}
                                    >
                                        <RefreshCw size={14} color="#475569" className="mr-1.5" />
                                        <Text className="text-xs font-semibold text-slate-700">Retake</Text>
                                    </TouchableOpacity>

                                    {!result && (
                                        <TouchableOpacity 
                                            onPress={handleAnalyze} 
                                            className="flex-row items-center py-2.5 px-6 bg-emerald-700 rounded-xl shadow-sm"
                                            disabled={analyzing}
                                        >
                                            {analyzing ? (
                                                <ActivityIndicator size="small" color="#ffffff" />
                                            ) : (
                                                <>
                                                    <Sparkles size={16} color="#ffffff" className="mr-2" />
                                                    <Text className="text-sm font-bold text-white">Analyze Health</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ) : (
                            /* Upload Box */
                            <View className="bg-white rounded-3xl border-2 border-dashed border-emerald-300 p-6 items-center justify-center mb-5">
                                <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-3">
                                    <Leaf size={32} color="#059669" />
                                </View>
                                <Text className="text-base font-bold text-gray-900 text-center">Capture Crop Leaf</Text>
                                <Text className="text-xs text-gray-500 text-center mt-1 mb-5 px-4">
                                    Take a clear, well-lit photo of the affected plant leaf for highest diagnosis accuracy.
                                </Text>

                                <View className="flex-row gap-3 w-full">
                                    <TouchableOpacity 
                                        onPress={handleCamera} 
                                        className="flex-1 flex-row items-center justify-center bg-emerald-700 py-3.5 px-4 rounded-xl shadow-sm"
                                    >
                                        <Camera size={18} color="#ffffff" className="mr-2" />
                                        <Text className="text-white font-bold text-sm">Take Photo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={handleGallery} 
                                        className="flex-1 flex-row items-center justify-center bg-emerald-50 border border-emerald-300 py-3.5 px-4 rounded-xl"
                                    >
                                        <ImageIcon size={18} color="#059669" className="mr-2" />
                                        <Text className="text-emerald-800 font-bold text-sm">Gallery</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Loading State */}
                        {analyzing && (
                            <View className="bg-white p-6 rounded-2xl border border-gray-100 items-center justify-center mb-5">
                                <ActivityIndicator size="large" color="#059669" />
                                <Text className="text-sm font-bold text-gray-800 mt-3">Analyzing Plant Foliage...</Text>
                                <Text className="text-xs text-gray-500 mt-1">Comparing with crop disease computer vision models</Text>
                            </View>
                        )}

                        {/* Diagnosis Results Card */}
                        {result && prediction && (
                            <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
                                {/* Status Header Banner */}
                                <View className={`p-4 rounded-2xl flex-row items-center mb-4 ${prediction.is_healthy ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                    {prediction.is_healthy ? (
                                        <CheckCircle2 size={30} color="#059669" className="mr-3" />
                                    ) : (
                                        <AlertTriangle size={30} color="#dc2626" className="mr-3" />
                                    )}
                                    <View className="flex-1">
                                        <Text className={`font-bold text-lg ${prediction.is_healthy ? 'text-emerald-950' : 'text-red-950'}`}>
                                            {prediction.disease_name}
                                        </Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            {prediction.crop_name && (
                                                <Text className="text-xs font-semibold text-gray-700 bg-white/80 py-0.5 px-2 rounded-md">
                                                    Crop: {prediction.crop_name}
                                                </Text>
                                            )}
                                            <Text className="text-xs font-semibold text-gray-700 bg-white/80 py-0.5 px-2 rounded-md">
                                                Confidence: {Math.round(prediction.confidence * 100)}%
                                            </Text>
                                            {advisory?.severity && (
                                                <Text className={`text-xs font-semibold py-0.5 px-2 rounded-md ${advisory.severity === 'High' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                                                    {advisory.severity} Severity
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* Description */}
                                {advisory?.description && (
                                    <View className="mb-5">
                                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Condition Overview</Text>
                                        <Text className="text-sm text-gray-700 leading-relaxed">{advisory.description}</Text>
                                    </View>
                                )}

                                {/* Treatment Protocol Tabs */}
                                <View className="flex-row bg-gray-100 p-1 rounded-xl mb-4">
                                    <TouchableOpacity 
                                        onPress={() => setActiveTab('organic')} 
                                        className={`flex-1 py-2 rounded-lg items-center justify-center flex-row ${activeTab === 'organic' ? 'bg-white shadow-sm' : ''}`}
                                    >
                                        <Leaf size={14} color={activeTab === 'organic' ? '#059669' : '#64748b'} className="mr-1.5" />
                                        <Text className={`text-xs font-bold ${activeTab === 'organic' ? 'text-emerald-800' : 'text-gray-500'}`}>
                                            Organic
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={() => setActiveTab('chemical')} 
                                        className={`flex-1 py-2 rounded-lg items-center justify-center flex-row ${activeTab === 'chemical' ? 'bg-white shadow-sm' : ''}`}
                                    >
                                        <FlaskConical size={14} color={activeTab === 'chemical' ? '#2563eb' : '#64748b'} className="mr-1.5" />
                                        <Text className={`text-xs font-bold ${activeTab === 'chemical' ? 'text-blue-800' : 'text-gray-500'}`}>
                                            Chemical
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={() => setActiveTab('prevention')} 
                                        className={`flex-1 py-2 rounded-lg items-center justify-center flex-row ${activeTab === 'prevention' ? 'bg-white shadow-sm' : ''}`}
                                    >
                                        <ShieldCheck size={14} color={activeTab === 'prevention' ? '#7c3aed' : '#64748b'} className="mr-1.5" />
                                        <Text className={`text-xs font-bold ${activeTab === 'prevention' ? 'text-purple-800' : 'text-gray-500'}`}>
                                            Prevention
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Active Tab Content */}
                                <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    {activeTab === 'organic' && (
                                        <View>
                                            <Text className="text-xs font-bold text-emerald-800 mb-2">Natural & Bio-remedies:</Text>
                                            {advisory?.organic_remedies?.map((tip, idx) => (
                                                <View key={idx} className="flex-row items-start mb-2">
                                                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 mr-2.5" />
                                                    <Text className="text-xs text-gray-700 flex-1 leading-5">{tip}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {activeTab === 'chemical' && (
                                        <View>
                                            <Text className="text-xs font-bold text-blue-800 mb-2">Recommended Fungicides & Dosage:</Text>
                                            {advisory?.chemical_remedies?.map((tip, idx) => (
                                                <View key={idx} className="flex-row items-start mb-2">
                                                    <View className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2.5" />
                                                    <Text className="text-xs text-gray-700 flex-1 leading-5">{tip}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {activeTab === 'prevention' && (
                                        <View>
                                            <Text className="text-xs font-bold text-purple-800 mb-2">Long-term Field Care:</Text>
                                            {advisory?.prevention_tips?.map((tip, idx) => (
                                                <View key={idx} className="flex-row items-start mb-2">
                                                    <View className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 mr-2.5" />
                                                    <Text className="text-xs text-gray-700 flex-1 leading-5">{tip}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Action Buttons */}
                                <TouchableOpacity 
                                    onPress={handleReset} 
                                    className="bg-emerald-700 py-3.5 px-4 rounded-xl items-center justify-center mt-5"
                                >
                                    <Text className="text-white font-bold text-sm">Scan Another Plant</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}

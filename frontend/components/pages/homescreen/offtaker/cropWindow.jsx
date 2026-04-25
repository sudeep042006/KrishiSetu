import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Alert, 
    ActivityIndicator, 
    Dimensions,
    StatusBar,
    Platform,
    BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
    MapPin, 
    Scale, 
    Calendar, 
    User, 
    ShieldCheck, 
    ChevronLeft, 
    TrendingUp, 
    Package,
    ArrowRight,
    Leaf
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env';
import { paymentService } from '../../service/api';
import apiClient from '../../service/api';
import Header from '../../../common/BHeader';

const { width } = Dimensions.get('window');

export default function CropWindow() {
    const route = useRoute();
    const navigation = useNavigation();
    const crop = route.params?.crop;
    const [isProcessing, setIsProcessing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('CropsPage');
                return true; 
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [navigation])
    );

    if (!crop) {
        return (
            <SafeAreaView className="flex-1 bg-[#f8fafc] justify-center items-center px-6">
                <Text className="text-slate-900 text-lg font-bold">Crop Data Missing</Text>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="mt-6 bg-[#1e4e8c] px-8 py-3 rounded-2xl"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBuyNow = async () => {
        try {
            setIsProcessing(true);
            const quantityVal = parseInt(crop.quantityRequired) || 1;
            const totalAmount = (crop.expectedPrice || 0) * quantityVal;

            const orderRes = await paymentService.createOrder({
                amount: totalAmount,
                relatedItem: crop._id,
                type: 'purchase'
            });

            if (!orderRes.success) {
                Alert.alert("Error", "Could not create order. Please try again.");
                setIsProcessing(false);
                return;
            }

            const { order } = orderRes;

            var options = {
                description: `Purchase of ${crop.cropName}`,
                image: (crop.cropPhoto && crop.cropPhoto !== 'pending') ? crop.cropPhoto : 'https://images.unsplash.com/photo-1592982537447-6f29fb2e5c65',
                currency: order.currency,
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                name: 'KrishiSetu Marketplace',
                order_id: order.id,
                theme: { color: '#1e4e8c' }
            };

            RazorpayCheckout.open(options).then(async (data) => {
                const verifyRes = await paymentService.verifyPayment({
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                });

                if (verifyRes.success) {
                    Alert.alert('Success', 'Payment Successful! Crop procured.');
                    navigation.goBack();
                } else {
                    Alert.alert('Verification Failed', 'Payment could not be verified.');
                }
            }).catch((error) => {
                console.log("Payment Error:", error);
                Alert.alert('Payment Cancelled', 'The payment process was interrupted.');
            });

        } catch (error) {
            console.error("Buy process error:", error);
            Alert.alert("Error", "Server connection failed. Please ensure the backend is running.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="light-content" backgroundColor="#14243e" />
            <SafeAreaView edges={['top']} className="flex-1">
                <Header 
                    title={crop.cropName || "Crop Details"} 
                    onBackPress={() => navigation.navigate('CropsPage')}
                    showBack={true}
                />
                
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Hero Image Section */}
                    <View className="px-5 mt-4">
                        <View className="h-72 rounded-[40px] overflow-hidden shadow-2xl border border-white">
                            <Image 
                                source={{ uri: (crop.cropPhoto && crop.cropPhoto !== 'pending') ? crop.cropPhoto : 'https://images.unsplash.com/photo-1592982537447-6f29fb2e5c65?q=80&w=2070' }} 
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)']}
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128 }}
                            />
                            <View className="absolute bottom-6 left-6 right-6">
                                <View className="bg-emerald-500 self-start px-3 py-1 rounded-full mb-2">
                                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Verified</Text>
                                </View>
                                <Text className="text-white text-3xl font-black">{crop.cropName}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Content Container */}
                    <View className="px-5 pt-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <View className="flex-row items-center mb-1">
                                    <MapPin size={14} color="#64748b" />
                                    <Text className="text-slate-500 font-bold ml-1 text-xs uppercase tracking-wider">
                                        {crop.location?.district ? `${crop.location.district}, ${crop.location.state}` : 'Location Available'}
                                    </Text>
                                </View>
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Primary Harvest</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-[#1e4e8c] text-3xl font-black">₹{crop.expectedPrice || 0}</Text>
                                <Text className="text-slate-400 font-bold text-xs">/ {crop.quantityUnit || 'unit'}</Text>
                            </View>
                        </View>

                    {/* Specifications Grid */}
                    <Text className="text-slate-900 text-xl font-black mb-4 ml-1">Specifications</Text>
                    <View className="flex-row flex-wrap justify-between mb-8">
                        <View className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm items-center mb-4">
                            <View className="bg-blue-50 p-3 rounded-2xl mb-3">
                                <Package size={22} color="#1e4e8c" />
                            </View>
                            <Text className="text-slate-900 font-black text-base">{crop.quantityRequired || '0'} {crop.quantityUnit}</Text>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Total Quantity</Text>
                        </View>

                        <View className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm items-center mb-4">
                            <View className="bg-amber-50 p-3 rounded-2xl mb-3">
                                <Calendar size={22} color="#d97706" />
                            </View>
                            <Text className="text-slate-900 font-black text-base">
                                {crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Ready'}
                            </Text>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Harvest Date</Text>
                        </View>

                        <View className="w-full bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 flex-row items-center mb-4">
                            <View className="bg-white p-3 rounded-2xl shadow-sm mr-4">
                                <ShieldCheck size={22} color="#10b981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-emerald-900 font-black text-base">Quality Grade: Premium</Text>
                                <Text className="text-emerald-600/70 text-[10px] uppercase font-bold tracking-wider">A+ Rated by KrishiSetu</Text>
                            </View>
                        </View>
                    </View>

                    {/* Farmer Section - Clickable */}
                    <Text className="text-slate-900 text-xl font-black mb-4 ml-1">Seller Information</Text>
                    <TouchableOpacity 
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('FarmerProfileWindow', { userId: crop.createdBy?._id })}
                        className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm mb-8 flex-row items-center"
                    >
                        <View className="w-16 h-16 bg-slate-100 rounded-2xl items-center justify-center border border-slate-200">
                            <User size={32} color="#64748b" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-black text-lg leading-tight">{crop.createdBy?.name || 'Verified Farmer'}</Text>
                            <View className="flex-row items-center mt-1">
                                <Leaf size={12} color="#059669" />
                                <Text className="text-slate-500 text-xs font-medium ml-1">Gold Level Producer • Pro Seller</Text>
                            </View>
                        </View>
                        <View className="bg-slate-100 p-2 rounded-full">
                            <ChevronLeft size={20} color="#94a3b8" style={{ transform: [{ rotate: '180deg' }] }} />
                        </View>
                    </TouchableOpacity>

                    {/* Description */}
                    <Text className="text-slate-900 text-xl font-black mb-4 ml-1">Description</Text>
                    <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8">
                        <Text className="text-slate-600 leading-7 text-[15px]">
                            {crop.description || "This premium harvest is sourced directly from certified sustainable farms. Carefully handled to maintain maximum nutrient value and quality standards for commercial procurement."}
                        </Text>
                    </View>

                    {/* Quick Safety Tip */}
                    <View className="flex-row items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-4">
                        <ShieldCheck size={18} color="#1e4e8c" />
                        <Text className="text-[#1e4e8c] text-[11px] font-medium ml-3 flex-1">
                            All payments are secured via Razorpay Escrow. Funds are only released to the farmer after successful delivery.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Premium Sticky Bottom Bar */}
            <View 
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pt-5 pb-10 flex-row items-center" 
                style={{ 
                    elevation: 25, 
                    shadowColor: '#000', 
                    shadowOffset: { width: 0, height: -15 }, 
                    shadowOpacity: 0.08, 
                    shadowRadius: 20 
                }}
            >
                <View className="flex-1">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1">Total Procurement</Text>
                    <Text className="text-[#1e4e8c] font-black text-3xl">₹{(crop.expectedPrice || 0) * (parseInt(crop.quantityRequired) || 1)}</Text>
                </View>
                <TouchableOpacity 
                    className={`h-16 flex-[1.4] rounded-2xl flex-row items-center justify-center shadow-lg ${isProcessing ? 'bg-slate-300' : 'bg-[#1e4e8c]'}`}
                    activeOpacity={0.9}
                    onPress={handleBuyNow}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="text-white font-black text-lg mr-2 uppercase tracking-wider">Buy Now</Text>
                            <ArrowRight size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
            </SafeAreaView>
        </View>
    );
}

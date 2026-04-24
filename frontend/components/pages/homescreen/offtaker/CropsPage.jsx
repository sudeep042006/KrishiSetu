import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, MapPin, Sprout, Star } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { CropService } from '../../service/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

export default function CropsPage() {
    const navigation = useNavigation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const res = await CropService.getProjects();
            if (res && res.projects) {
                const available = res.projects.filter(p => p.status !== 'completed');
                setCrops(available);
            }
        } catch (error) {
            console.error("Error fetching crops:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCrops = crops.filter(c => 
        (c.cropName && c.cropName.toLowerCase().includes(search.toLowerCase())) ||
        (c.location?.state && c.location.state.toLowerCase().includes(search.toLowerCase())) ||
        (c.location?.district && c.location.district.toLowerCase().includes(search.toLowerCase()))
    );

    const renderCrop = ({ item }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={{ width: CARD_WIDTH }}
            className="bg-white rounded-[28px] mb-5 shadow-sm border border-slate-100 overflow-hidden"
            onPress={() => navigation.navigate('CropWindow', { crop: item })}
        >
            <View className="relative">
                <Image 
                    source={{ uri: (item.cropPhoto && item.cropPhoto !== 'pending') ? item.cropPhoto : 'https://images.unsplash.com/photo-1592982537447-6f29fb2e5c65?q=80&w=2070' }} 
                    className="w-full h-40 bg-slate-200"
                />
                <View className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex-row items-center">
                    <Star size={10} color="#fbbf24" fill="#fbbf24" />
                    <Text className="text-white text-[10px] font-bold ml-1">4.8</Text>
                </View>
            </View>

            <View className="p-3">
                <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>{item.cropName || 'Premium Crop'}</Text>
                
                <View className="flex-row items-center mt-1">
                    <MapPin size={10} color="#64748b" />
                    <Text className="text-slate-500 text-[10px] font-medium ml-1" numberOfLines={1}>
                        {item.location?.district || 'Nearby'}
                    </Text>
                </View>

                <View className="mt-3 pt-3 border-t border-slate-50 flex-row items-center justify-between">
                    <View>
                        <Text className="text-[#1e4e8c] font-black text-sm">₹{item.expectedPrice || 0}</Text>
                        <Text className="text-slate-400 text-[8px] uppercase font-bold tracking-tighter">per {item.quantityUnit || 'unit'}</Text>
                    </View>
                    <View className="bg-emerald-50 px-2 py-1 rounded-lg">
                        <Text className="text-emerald-700 font-bold text-[9px]">{item.quantityRequired}{item.quantityUnit}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Marketplace" />
                
                <View className="px-5 py-4 flex-row items-center" style={{ gap: 10 }}>
                    <View className="flex-1 bg-white rounded-2xl flex-row items-center px-4 py-2.5 shadow-sm border border-slate-200">
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            className="ml-2 flex-1 text-slate-900 text-sm h-8 p-0"
                            placeholder="Find fresh crops..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity className="bg-[#1e4e8c] p-3 rounded-2xl shadow-lg">
                        <Filter size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#1e4e8c" />
                        <Text className="mt-4 text-slate-500 font-medium">Scanning live market...</Text>
                    </View>
                ) : (
                    <FlatList
                        key={2}
                        data={filteredCrops}
                        keyExtractor={item => item._id}
                        renderItem={renderCrop}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                        contentContainerStyle={{ paddingTop: 5, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-10 mt-10 px-10">
                                <View className="bg-slate-100 p-6 rounded-full mb-4">
                                    <Sprout size={48} color="#cbd5e1" />
                                </View>
                                <Text className="text-slate-900 font-bold text-lg mb-1">No crops available</Text>
                                <Text className="text-slate-400 text-center font-medium">We couldn't find any listings matching your search right now.</Text>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { ProposalService } from '../../service/api';

export default function RequestFromOfftaker() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const data = await ProposalService.getFarmerProposals();
            if (data.success) {
                setProposals(data.proposals);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProposals();
    }, []);

    const handleUpdateStatus = async (proposalId, status) => {
        try {
            setActionLoading(proposalId);
            const response = await ProposalService.updateProposalStatus(proposalId, status);
            if (response.success) {
                Alert.alert('Status Updated', `You have ${status.toLowerCase()} this proposal.`);
                fetchProposals();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Could not update status. Try again.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Incoming Proposals" />

                <View className="flex-1 bg-[#f8fafc]">
                    {loading && !refreshing ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1e4a3b" />
                        </View>
                    ) : (
                        <ScrollView 
                            className="flex-1 px-4 pt-4" 
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#1e4a3b"
                                    colors={['#1e4a3b']}
                                />
                            }
                        >
                            {proposals.length === 0 ? (
                                <View className="flex-1 justify-center items-center px-8 py-20">
                                    <View className="w-20 h-20 rounded-full bg-[#eaf3ec] justify-center items-center mb-5">
                                        <Text style={{ fontSize: 36 }}>📬</Text>
                                    </View>
                                    <Text className="text-xl font-bold text-[#1e4a3b] mb-2">No Incoming Proposals</Text>
                                    <Text className="text-gray-400 text-sm text-center leading-5">
                                        You don't have any direct procurement requests from offtakers yet. Keep your profile updated to attract buyers.
                                    </Text>
                                </View>
                            ) : (
                                proposals.map(p => {
                                    const totalValue = (p.quantity * p.pricePerUnit).toLocaleString('en-IN');
                                    const offtakerPhoto = p.offtakerId?.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

                                    return (
                                        <View key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                                            <View className={`h-1 w-full ${p.status === 'Pending' ? 'bg-orange-400' : p.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            
                                            <View className="p-4 border-b border-gray-50 flex-row items-center">
                                                <Image source={{ uri: offtakerPhoto }} className="w-12 h-12 rounded-full mr-3 bg-gray-100" />
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{p.offtakerId?.name}</Text>
                                                    <Text className="text-xs text-gray-500">{p.offtakerId?.companyName || 'Verified Buyer'}</Text>
                                                </View>
                                                <View className={`px-2 py-1 rounded-full ${p.status === 'Accepted' ? 'bg-green-100' : p.status === 'Rejected' ? 'bg-red-100' : 'bg-orange-100'}`}>
                                                    <Text className={`text-xs font-bold ${p.status === 'Accepted' ? 'text-green-700' : p.status === 'Rejected' ? 'text-red-700' : 'text-orange-700'}`}>{p.status}</Text>
                                                </View>
                                            </View>

                                            <View className="p-4">
                                                <View className="flex-row justify-between items-center mb-3">
                                                    <Text className="text-[#1e4a3b] font-black text-lg">{p.cropName}</Text>
                                                    <Text className="text-gray-500 text-xs">Due: {new Date(p.deliveryDate).toLocaleDateString()}</Text>
                                                </View>
                                                
                                                <View className="flex-row bg-[#f8fafc] rounded-xl p-3 mb-3 border border-gray-100">
                                                    <View className="flex-1 border-r border-gray-200">
                                                        <Text className="text-xs text-gray-400 font-bold mb-1">QUANTITY</Text>
                                                        <Text className="text-gray-800 font-semibold">{p.quantity} {p.unit}</Text>
                                                    </View>
                                                    <View className="flex-1 pl-3">
                                                        <Text className="text-xs text-gray-400 font-bold mb-1">RATE</Text>
                                                        <Text className="text-gray-800 font-semibold">₹{p.pricePerUnit}/{p.unit}</Text>
                                                    </View>
                                                </View>

                                                <View className="flex-row justify-between items-center mb-3">
                                                    <Text className="text-gray-600 font-bold">Total Contract Value:</Text>
                                                    <Text className="text-emerald-700 font-black text-lg">₹ {totalValue}</Text>
                                                </View>

                                                {p.message ? (
                                                    <View className="bg-orange-50 rounded-lg p-3 mb-2">
                                                        <Text className="text-xs font-bold text-orange-800 mb-1">Message from buyer:</Text>
                                                        <Text className="text-orange-700 text-xs">{p.message}</Text>
                                                    </View>
                                                ) : null}
                                            </View>

                                            {p.status === 'Pending' && (
                                                <View className="flex-row border-t border-gray-100">
                                                    <TouchableOpacity 
                                                        disabled={actionLoading === p._id}
                                                        onPress={() => handleUpdateStatus(p._id, 'Rejected')}
                                                        className="flex-1 py-4 items-center border-r border-gray-100 active:bg-gray-50"
                                                    >
                                                        <Text className="text-red-500 font-bold">Reject</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        disabled={actionLoading === p._id}
                                                        onPress={() => handleUpdateStatus(p._id, 'Accepted')}
                                                        className="flex-1 py-4 items-center bg-emerald-50 active:bg-emerald-100"
                                                    >
                                                        {actionLoading === p._id ? (
                                                            <ActivityIndicator size="small" color="#059669" />
                                                        ) : (
                                                            <Text className="text-emerald-700 font-bold">Accept Offer</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                            <View className="h-20" />
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

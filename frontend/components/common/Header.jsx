import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Bell, Sparkles } from 'lucide-react-native';
import { useNavigation, DrawerActions, useRoute } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

export default function Header({ title, showNotification = false, rightIcon = null }) {
    const navigation = useNavigation();
    const { isDarkMode } = React.useContext(ThemeContext);
    const [role, setRole] = React.useState(null);

    React.useEffect(() => {
        const getRole = async () => {
            const r = await require('@react-native-async-storage/async-storage').default.getItem('userRole');
            setRole(r);
        };
        getRole();
    }, []);

    const isBuyer = role === 'Buyer';
    const sarthiBg = isBuyer ? 'bg-blue-500/20' : 'bg-emerald-500/20';
    const sarthiBorder = isBuyer ? 'border-blue-400/30' : 'border-emerald-400/30';
    const sarthiIconColor = isBuyer ? '#60a5fa' : '#4ade80';

    return (
        <View className="flex-row items-center justify-between h-10 px-4 pt-12 pb-5 bg-[#020f04e9] dark:bg-[#000000] rounded-b-3xl">
            <TouchableOpacity 
                className="mr-3 -mt-8"
                activeOpacity={0.7}
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
                <Menu color="#ffffff" size={24} />
            </TouchableOpacity>

            <Text className="text-lg font-bold text-white dark:text-gray-100 tracking-wide -mt-8">{title}</Text>

            <View className="items-end min-w-[24px] -mt-8 flex-row gap-x-2">
                {showNotification && (
                    <TouchableOpacity activeOpacity={0.7} className="bg-white/10 p-2 rounded-full">
                        <Bell color="#ffffff" size={20} />
                    </TouchableOpacity>
                )}
                
                {/* Apla Sarthi Icon in Header */}
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    className={`${sarthiBg} p-2 rounded-full border ${sarthiBorder}`}
                    onPress={() => DeviceEventEmitter.emit('openAplaSarthi')}
                >
                    <Sparkles color={sarthiIconColor} size={20} />
                </TouchableOpacity>

                {rightIcon}
            </View>
        </View>
    );
}

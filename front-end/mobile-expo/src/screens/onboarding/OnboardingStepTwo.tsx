import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { TrendingUp, Landmark, ShieldCheck, Zap, ArrowRight } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get('window');

const PRODUCTS = [
    { id: 1, title: 'Unlisted Shares', icon: TrendingUp, color: '#818cf8', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
    { id: 2, title: 'Loans', icon: Landmark, color: '#34d399', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    { id: 3, title: 'Insurance', icon: ShieldCheck, color: '#60a5fa', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    { id: 4, title: 'Funding', icon: Zap, color: '#fbbf24', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
];

export function OnboardingStepTwo() {
    const navigation = useNavigation<any>();

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            <ImageBackground
                source={require('../../../assets/onboarding/onboarding_2_ultra.png')}
                className="flex-1"
                resizeMode="cover"
            >
                {/* Dark Overlay */}
                <View className="absolute inset-0 bg-black/60" />
                <View className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

                <SafeAreaView className="flex-1 px-6 pt-4 pb-8 justify-between">
                    {/* Header */}
                    <Animated.View
                        entering={FadeInDown.delay(300).duration(800)}
                        className="flex-row justify-end"
                    >
                        <TouchableOpacity
                            onPress={() => navigation.replace('Login')}
                            className="px-4 py-2"
                        >
                            <Text className="text-white/80 text-base font-medium">Skip</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Content */}
                    <View className="flex-1 justify-center">
                        <Animated.Text
                            entering={FadeInDown.delay(400).duration(800)}
                            className="text-white text-4xl font-bold mb-2 text-center"
                        >
                            Complete{"\n"}
                            <Text className="text-emerald-400">Financial Suite</Text>
                        </Animated.Text>

                        <Animated.Text
                            entering={FadeInDown.delay(500).duration(800)}
                            className="text-gray-300 text-base mb-10 text-center px-8"
                        >
                            Access every financial product your clients need.
                        </Animated.Text>

                        {/* Product Grid */}
                        <View className="flex-row flex-wrap justify-between gap-y-4">
                            {PRODUCTS.map((item, index) => (
                                <Animated.View
                                    key={item.id}
                                    entering={ZoomIn.delay(600 + (index * 100)).duration(600).springify()}
                                    className={`w-[48%] aspect-square rounded-3xl ${item.bg} border ${item.border} backdrop-blur-md items-center justify-center p-4`}
                                >
                                    <View className="mb-3 p-3 bg-white/10 rounded-full">
                                        <item.icon size={32} color={item.color} strokeWidth={2} />
                                    </View>
                                    <Text className="text-white text-lg font-semibold text-center leading-tight">
                                        {item.title.replace(' ', '\n')}
                                    </Text>
                                </Animated.View>
                            ))}
                        </View>
                    </View>

                    {/* Next Button */}
                    <AnimatedTouchableOpacity
                        entering={FadeInUp.delay(1000).duration(800).springify()}
                        onPress={() => navigation.navigate('OnboardingThree')}
                        className="bg-white rounded-full py-4 px-8 flex-row items-center justify-center shadow-lg shadow-black/25 mt-8"
                        activeOpacity={0.9}
                    >
                        <Text className="text-black text-lg font-bold mr-2">Next Step</Text>
                        <ArrowRight stroke="black" size={20} strokeWidth={2.5} />
                    </AnimatedTouchableOpacity>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

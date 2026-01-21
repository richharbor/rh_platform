import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Trophy, Coins, Zap, ArrowRight, Star } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function OnboardingStepThree() {
    const navigation = useNavigation<any>();

    const handleFinish = async () => {
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
        navigation.replace('Login');
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            <ImageBackground
                source={require('../../../assets/onboarding/onboarding_3_ultra.png')}
                className="flex-1"
                resizeMode="cover"
            >
                {/* Dark Overlay */}
                <View className="absolute inset-0 bg-black/50" />
                <View className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <SafeAreaView className="flex-1 px-6 pt-4 pb-8 justify-between">
                    {/* Top Content (Spacer or Logo could go here) */}
                    <View className="flex-1 justify-center">
                        <Animated.View
                            entering={ZoomIn.delay(300).duration(1000).springify()}
                            className="items-center mb-10"
                        >
                            <View className="bg-yellow-400/20 p-6 rounded-full mb-6 backdrop-blur-sm border border-yellow-400/30">
                                <Trophy size={64} color="#facc15" strokeWidth={1.5} />
                            </View>
                        </Animated.View>

                        <Animated.Text
                            entering={FadeInDown.delay(400).duration(800)}
                            className="text-white text-5xl font-bold mb-4 text-center leading-tight"
                        >
                            Earn <Text className="text-yellow-400">Unlimited</Text>{"\n"}Rewards
                        </Animated.Text>

                        <Animated.Text
                            entering={FadeInDown.delay(500).duration(800)}
                            className="text-gray-200 text-lg text-center mb-12 px-4"
                        >
                            Turn your network into net worth with industry-leading commissions.
                        </Animated.Text>

                        {/* Feature Highlights */}
                        <View className="flex-row justify-around mb-8">
                            <Animated.View
                                entering={FadeInUp.delay(600).springify()}
                                className="items-center"
                            >
                                <View className="bg-emerald-500/20 p-3 rounded-2xl mb-2 border border-emerald-500/30">
                                    <Coins size={24} color="#34d399" />
                                </View>
                                <Text className="text-white text-center text-xs font-medium">High{'\n'}Payouts</Text>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInUp.delay(700).springify()}
                                className="items-center"
                            >
                                <View className="bg-blue-500/20 p-3 rounded-2xl mb-2 border border-blue-500/30">
                                    <Zap size={24} color="#60a5fa" />
                                </View>
                                <Text className="text-white text-center text-xs font-medium">Instant{'\n'}Settlement</Text>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInUp.delay(800).springify()}
                                className="items-center"
                            >
                                <View className="bg-purple-500/20 p-3 rounded-2xl mb-2 border border-purple-500/30">
                                    <Star size={24} color="#c084fc" />
                                </View>
                                <Text className="text-white text-center text-xs font-medium">Exclusive{'\n'}Bonuses</Text>
                            </Animated.View>
                        </View>
                    </View>

                    {/* Bottom Action */}
                    <AnimatedTouchableOpacity
                        entering={FadeInUp.delay(1000).duration(800).springify()}
                        onPress={handleFinish}
                        className="bg-white rounded-full py-4 px-8 flex-row items-center justify-center shadow-lg shadow-yellow-400/20"
                        activeOpacity={0.9}
                    >
                        <Text className="text-black text-lg font-bold mr-2">Start Earning Now</Text>
                        <ArrowRight stroke="black" size={20} strokeWidth={2.5} />
                    </AnimatedTouchableOpacity>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function OnboardingStepOne() {
    const navigation = useNavigation<any>();

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            {/* Background Image */}
            <ImageBackground
                source={require('../../../assets/onboarding/onboarding_1_ultra.png')}
                className="flex-1 justify-end"
                resizeMode="cover"
            >
                {/* Dark Overlay Gradient Simulation */}
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />

                <SafeAreaView className="flex-1 flex-col justify-between px-6 pb-8 pt-4">
                    {/* Header / Skip */}
                    <Animated.View
                        entering={FadeInDown.delay(300).duration(1000)}
                        className="flex-row justify-end"
                    >
                        <TouchableOpacity
                            onPress={() => navigation.replace('Login')}
                            className="px-4 py-2"
                        >
                            <Text className="text-white/80 text-base font-medium">Skip</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Main Content */}
                    <View className="mb-8">
                        <Animated.Text
                            entering={FadeInDown.delay(400).duration(1000).springify()}
                            className="text-white text-5xl font-bold leading-tight mb-4"
                        >
                            Connect{"\n"}
                            <Text className="text-indigo-400">Collaborate</Text>{"\n"}
                            Conquer
                        </Animated.Text>

                        <Animated.Text
                            entering={FadeInDown.delay(600).duration(1000)}
                            className="text-gray-300 text-lg leading-6 mb-8 pr-8"
                        >
                            Unlock exclusive leads and grow your network with Rich Harbor's premium partner ecosystem.
                        </Animated.Text>

                        {/* Action Buttons */}
                        <AnimatedTouchableOpacity
                            entering={FadeInUp.delay(800).duration(1000).springify()}
                            onPress={() => navigation.navigate('OnboardingTwo')}
                            className="bg-white rounded-full py-4 px-8 flex-row items-center justify-center shadow-lg shadow-black/25"
                            activeOpacity={0.9}
                        >
                            <Text className="text-black text-lg font-bold mr-2">Get Started</Text>
                            <ArrowRight stroke="black" size={20} strokeWidth={2.5} />
                        </AnimatedTouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

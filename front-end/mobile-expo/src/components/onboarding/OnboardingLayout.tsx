import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { PrimaryButton } from '../';

const { width, height } = Dimensions.get('window');

interface OnboardingLayoutProps {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    image: any;
    onNext: () => void;
    onSkip: () => void;
    isLastStep?: boolean;
}

export function OnboardingLayout({
    step,
    totalSteps,
    title,
    description,
    image,
    onNext,
    onSkip,
    isLastStep
}: OnboardingLayoutProps) {
    // Animation values
    const cardOpacity = useSharedValue(0);
    const cardTranslateY = useSharedValue(100);
    const heroScale = useSharedValue(1.1);
    const heroOpacity = useSharedValue(0);

    useEffect(() => {
        heroOpacity.value = withTiming(1, { duration: 1000 });
        heroScale.value = withTiming(1, { duration: 1200 });
        cardOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
        cardTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
    }, [step]);

    const animatedHeroStyle = useAnimatedStyle(() => ({
        opacity: heroOpacity.value,
        transform: [{ scale: heroScale.value }]
    }));

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ translateY: cardTranslateY.value }]
    }));

    return (
        <View className="flex-1 bg-white">
            {/* Full Screen Hero Image Background */}
            <View className="absolute inset-0 w-full h-full">
                <Animated.Image
                    source={image}
                    className="w-full h-full"
                    resizeMode="cover"
                    style={animatedHeroStyle}
                />
                {/* Soft immersive overlay for depth */}
                <View
                    className="absolute inset-x-0 bottom-0 h-[60%] bg-white/10"
                    style={{ backdropFilter: 'blur(5px)' } as any}
                />
            </View>

            <SafeAreaView className="flex-1">
                {/* Top Header - Floating over hero */}
                <View className="flex-row items-center justify-between px-8 pt-4 z-20">
                    <View className="w-10" />
                    <Image
                        source={require('../../../assets/logo.png')}
                        className="w-32 h-16"
                        resizeMode="contain"
                    />
                    <TouchableOpacity onPress={onSkip} className="w-10">
                        {!isLastStep && (
                            <View className="bg-white/20 px-3 py-1.5 min-w-[52px] rounded-full border border-white/30" style={{ backdropFilter: 'blur(10px)' } as any}>
                                <Text className="text-white font-bold  text-[10px] tracking-widest uppercase">Skip</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="flex-1" />

                {/* Floating Glassmorphism Hero Card */}
                <Animated.View
                    style={[animatedCardStyle, styles.glassCard]}
                    className="mx-6 mb-10 p-8 rounded-[48px] items-center border border-white/50 overflow-hidden shadow-2xl"
                >
                    {/* Real Glassmorphism effect */}
                    <View
                        className="absolute inset-0 bg-white/80"
                        style={{ backdropFilter: 'blur(30px)' } as any}
                    />

                    {/* Premium Indicator Track */}
                    <View className="flex-row justify-center mb-10 space-x-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <View
                                key={i}
                                className={`h-[4px] rounded-full transition-all duration-500 ${i === step - 1 ? 'w-10 bg-brand-500' : 'w-2 bg-brand-500/10'
                                    }`}
                            />
                        ))}
                    </View>

                    {/* Dynamic Typography Section */}
                    <View className="items-center mb-12">
                        <Text className="text-[38px] font-black text-ink-900 text-center leading-[44px] tracking-tight">
                            {title}
                        </Text>
                        <Text className="mt-5 text-[18px] text-ink-600 text-center px-2 leading-7 font-medium opacity-80">
                            {description}
                        </Text>
                    </View>

                    {/* Hyper-Premium Action Button */}
                    <View className="w-full">
                        <PrimaryButton
                            label={isLastStep ? "Enter the Harbor" : "Continue"}
                            fullWidth
                            onPress={onNext}
                        />
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    glassCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    }
});

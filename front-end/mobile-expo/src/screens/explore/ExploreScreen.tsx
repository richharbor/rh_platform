import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export function ExploreScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <View className="p-4">
                <Text className="text-xl font-bold text-center text-ink-900 mb-2">Explore</Text>
                <Text className="text-ink-500 text-center">
                    Discover new opportunities and features here.
                </Text>
            </View>
        </SafeAreaView>
    );
}

import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Contest, contestService } from '../services/contestService';
import { CheckCircle, Lock, Unlock } from 'lucide-react-native';

interface ContestCardProps {
    contest: Contest;
    onClaimSuccess: () => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest, onClaimSuccess }) => {
    const handleClaim = async (tierName: string) => {
        try {
            await contestService.claimReward(contest.id, tierName);
            Alert.alert("Success", "Reward claimed successfully!");
            onClaimSuccess();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to claim reward.");
        }
    };

    const progressPercent = Math.min((contest.progress.current / contest.progress.target) * 100, 100);

    return (
        <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm border border-gray-100">
            {/* Banner */}
            <View className="h-40 bg-gray-200 relative">
                {contest.bannerUrl ? (
                    <Image source={{ uri: contest.bannerUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-blue-50">
                        <Text className="text-blue-500 font-bold text-lg">Contest</Text>
                    </View>
                )}
                <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-medium">Ends {new Date(contest.endDate).toLocaleDateString()}</Text>
                </View>
            </View>

            <View className="p-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">{contest.title}</Text>
                <Text className="text-gray-500 text-sm mb-4">{contest.description}</Text>

                {/* Overall Progress */}
                <View className="mb-6">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-gray-500">Your Progress</Text>
                        <Text className="text-xs font-bold text-gray-900">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(contest.progress.current)}
                            / {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(contest.progress.target)}
                        </Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </View>
                </View>

                {/* Tiers */}
                <View className="space-y-3">
                    {contest.tiers.map((tier, index) => (
                        <View key={index} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <View className="flex-1">
                                <Text className="font-semibold text-gray-800">{tier.name}</Text>
                                <Text className="text-xs text-gray-500">Target: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tier.minAmount)}</Text>
                            </View>

                            <View>
                                {tier.isClaimed ? (
                                    <View className="flex-row items-center gap-1 bg-green-100 px-2 py-1 rounded">
                                        <CheckCircle size={14} color="green" />
                                        <Text className="text-xs font-medium text-green-700">Claimed</Text>
                                    </View>
                                ) : tier.isUnlocked ? (
                                    <TouchableOpacity
                                        onPress={() => handleClaim(tier.name)}
                                        className="bg-blue-600 px-3 py-1.5 rounded shadow-sm flex-row items-center gap-1"
                                    >
                                        <Unlock size={14} color="white" />
                                        <Text className="text-xs font-bold text-white">Claim</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-row items-center gap-1 opacity-50 px-2 py-1">
                                        <Lock size={14} color="gray" />
                                        <Text className="text-xs text-gray-500">Locked</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

            </View>
        </View>
    );
};

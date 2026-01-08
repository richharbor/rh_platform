import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Contest } from '../services/contestService';
import { CheckCircle, Lock, Trophy, Download, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface ContestCardProps {
    contest: Contest;
    onClaimSuccess?: () => void; // Optional now
}

export function ContestCard({ contest, onClaimSuccess }: ContestCardProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Progress Calculation
    const progressPercent = Math.min((contest.progress.current / contest.progress.target) * 100, 100);

    const imageUrl = contest.bannerUrl;

    const handleDownload = async () => {
        if (!imageUrl) return;
        setDownloading(true);
        try {
            const filename = imageUrl.split('/').pop() || 'contest-poster.jpg';
            // Types might be missing in some versions, casting to any
            const fs = FileSystem as any;
            const dir = fs.documentDirectory || fs.cacheDirectory || '';
            const fileUri = dir + filename;

            const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("Success", "Image saved to documents!");
            }
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Failed to download image.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm border border-gray-100">
                {/* Banner / Poster */}
                <TouchableOpacity
                    className="h-48 bg-gray-200 relative"
                    activeOpacity={0.9}
                    onPress={() => imageUrl && setModalVisible(true)}
                    disabled={!imageUrl}
                >
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-blue-50">
                            <Trophy size={40} color="#3B82F6" />
                            <Text className="text-blue-500 font-bold text-lg mt-2">Contest</Text>
                        </View>
                    )}
                    {/* Overlay Status */}
                    {/* Removed: Ends {new Date(contest.endDate).toLocaleDateString()} */}
                    {contest.isEligible && (
                        <View className="absolute bottom-2 right-2 bg-green-600 px-3 py-1 rounded-full shadow-lg">
                            <Text className="text-white text-xs font-bold">ELIGIBLE FOR REWARDS</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="p-4">
                    <Text className="text-lg font-bold text-gray-900 mb-1">{contest.title}</Text>

                    {/* Product Type & SubType Badges */}
                    {(contest.productType || contest.productSubType) && (
                        <View className="flex-row gap-2 mb-2">
                            {contest.productType && (
                                <View className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    <Text className="text-[10px] font-medium text-blue-700 capitalize">
                                        {contest.productType}
                                    </Text>
                                </View>
                            )}
                            {contest.productSubType && (
                                <View className="bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                    <Text className="text-[10px] font-medium text-purple-700 capitalize">
                                        {contest.productSubType}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{contest.description}</Text>

                    {/* Overall Progress */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</Text>
                            <Text className="text-xs font-bold text-brand-600">
                                {contest.progress.current.toLocaleString()} / {contest.progress.target.toLocaleString()}
                            </Text>
                        </View>
                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${Math.min((contest.progress.current / contest.progress.target) * 100, 100)}%` }}
                            />
                        </View>
                    </View>

                    {/* Tiers Status */}
                    <View className="space-y-3">
                        {contest.tiers.map((tier, index) => (
                            <View key={index} className={`flex-row items-center justify-between p-3 rounded-lg border ${tier.isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                <View className="flex-1">
                                    <Text className={`font-bold ${tier.isUnlocked ? 'text-green-800' : 'text-gray-800'}`}>{tier.name}</Text>
                                    <Text className="text-xs text-gray-500 mt-0.5">Target: ₹{tier.minAmount.toLocaleString()}</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">{tier.rewardDescription}</Text>
                                </View>
                                <View>
                                    {tier.isUnlocked ? (
                                        <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded border border-green-200 shadow-sm">
                                            <CheckCircle size={14} color="green" />
                                            <Text className="text-xs font-bold text-green-700">ELIGIBLE</Text>
                                        </View>
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

            {/* Full Screen Image Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/90 justify-center items-center relative">
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        className="absolute top-12 right-6 z-20 bg-white/20 p-2 rounded-full"
                    >
                        <X size={24} color="white" />
                    </TouchableOpacity>

                    {/* Image */}
                    {imageUrl && (
                        <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-3/4"
                            resizeMode="contain"
                        />
                    )}

                    {/* Download Button */}
                    <TouchableOpacity
                        onPress={handleDownload}
                        disabled={downloading}
                        className="absolute bottom-12 bg-white px-6 py-3 rounded-full flex-row items-center gap-2 shadow-lg"
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <>
                                <Download size={20} color="black" />
                                <Text className="font-bold text-black">Download Poster</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

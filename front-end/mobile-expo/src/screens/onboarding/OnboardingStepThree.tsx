import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function OnboardingStepThree() {
    const navigation = useNavigation<any>();

    const handleFinish = async () => {
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Get Started Today</Text>
                <Text style={styles.description}>Join our community of partners and start earning.</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleFinish}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
    content: { padding: 20, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    button: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, width: '100%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export function OnboardingStepOne() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Rich Harbor</Text>
                <Text style={styles.description}>Connect with leads and grow your business.</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('OnboardingTwo')}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.skipButton]}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={[styles.buttonText, styles.skipText]}>Skip</Text>
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
    button: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginBottom: 10, width: '100%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    skipButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
    skipText: { color: '#666' }
});

import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Platform } from "react-native";
import { useState } from "react";

export default function Index() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [data, setData] = useState<string | null>(null);

    const checkHealth = async () => {
        setStatus("loading");
        try {
            const apiUrl = "http://10.0.2.2:8000/v1/health";
            const response = await fetch(apiUrl);

            if (response.ok) {
                const json = await response.json();
                setData(JSON.stringify(json, null, 2));
                setStatus("success");
            } else {
                setData(`Error: ${response.status}`);
                setStatus("error");
            }
        } catch (error) {
            console.error(error);
            setData(String(error));
            setStatus("error");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🏥</Text>
                    </View>
                    <Text style={styles.title}>Service Health</Text>
                    <Text style={styles.subtitle}>Check backend connectivity status</Text>
                </View>

                {/* Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        status === "loading" && styles.buttonDisabled
                    ]}
                    onPress={checkHealth}
                    disabled={status === "loading"}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonContent}>
                        {status === "loading" ? (
                            <>
                                <ActivityIndicator color="white" size="small" />
                                <Text style={styles.buttonText}>Checking...</Text>
                            </>
                        ) : (
                            <Text style={styles.buttonText}>Check Health Status</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Status Card */}
                {status !== "idle" && (
                    <View style={styles.statusCard}>
                        <View style={[
                            styles.statusContent,
                            status === "success" ? styles.statusSuccess : styles.statusError
                        ]}>
                            {/* Status Header */}
                            <View style={styles.statusHeader}>
                                <View style={[
                                    styles.statusDot,
                                    status === "success" ? styles.dotSuccess : styles.dotError
                                ]} />
                                <Text style={[
                                    styles.statusTitle,
                                    status === "success" ? styles.textSuccess : styles.textError
                                ]}>
                                    {status === "success" ? "✓ Connected" : "✗ Connection Failed"}
                                </Text>
                            </View>

                            {/* Response Data */}
                            <View style={styles.responseContainer}>
                                <Text style={styles.responseLabel}>RESPONSE</Text>
                                <Text style={styles.responseText}>{data}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Footer */}
                {status === "idle" && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Tap the button to test API connectivity
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 48,
        paddingBottom: 48,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#2563eb',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },

    // Button
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        marginBottom: 32,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Status Card
    statusCard: {
        width: '100%',
    },
    statusContent: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
    },
    statusSuccess: {
        backgroundColor: '#f0fdf4',
        borderColor: '#86efac',
    },
    statusError: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    dotSuccess: {
        backgroundColor: '#22c55e',
    },
    dotError: {
        backgroundColor: '#ef4444',
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    textSuccess: {
        color: '#15803d',
    },
    textError: {
        color: '#b91c1c',
    },

    // Response
    responseContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    responseLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    responseText: {
        fontSize: 14,
        color: '#1f2937',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    // Footer
    footer: {
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
});

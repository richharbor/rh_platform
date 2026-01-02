import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react-native';

interface AlertAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    actions?: AlertAction[];
    type?: AlertType;
    onClose?: () => void;
}

export function CustomAlert({ visible, title, message, actions = [], type = 'info', onClose }: CustomAlertProps) {


    // Default action if none provided
    const alertActions = actions.length > 0 ? actions : [{ text: 'OK', onPress: onClose, style: 'default' }];

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={48} color="#22c55e" strokeWidth={2.5} />;
            case 'error':
                return <XCircle size={48} color="#ef4444" strokeWidth={2.5} />;
            case 'warning':
                return <AlertCircle size={48} color="#f59e0b" strokeWidth={2.5} />;
            default:
                return <Info size={48} color="#3b82f6" strokeWidth={2.5} />;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-100';
            case 'error': return 'bg-red-100';
            case 'warning': return 'bg-amber-100';
            default: return 'bg-blue-100';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <BlurView
                style={StyleSheet.absoluteFill}
                intensity={60}
                tint="dark"
            />

            <View className="flex-1 justify-center items-center px-6">
                <View className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl shadow-black/20 items-center">
                    <View className={`h-20 w-20 rounded-full items-center justify-center mb-4 ${getIconBgColor()}`}>
                        {getIcon()}
                    </View>

                    <Text className="text-xl font-bold text-gray-900 text-center mb-2 tracking-tight">
                        {title}
                    </Text>

                    <Text className="text-gray-500 text-base text-center mb-8 leading-6">
                        {message}
                    </Text>

                    <View className="w-full gap-3">
                        {alertActions.map((action, index) => {
                            const isCancel = action.style === 'cancel';
                            const isDestructive = action.style === 'destructive';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        action.onPress?.();
                                        onClose?.();
                                    }}
                                    className={`w-full py-3.5 rounded-xl items-center justify-center ${isCancel
                                        ? 'bg-gray-100'
                                        : isDestructive
                                            ? 'bg-red-500'
                                            : 'bg-black'
                                        }`}
                                >
                                    <Text className={`font-semibold text-base ${isCancel ? 'text-gray-900' : 'text-white'}`}>
                                        {action.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );

}

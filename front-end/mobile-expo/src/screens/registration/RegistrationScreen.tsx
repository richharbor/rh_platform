import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { PrimaryButton, SecondaryButton, TextField } from '../../components';
import type { AuthStackScreenProps } from '../../navigation/types';
import { ONBOARDING_CONFIG, type Question, type OnboardingFlow } from '../../config/onboarding';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

export function RegistrationScreen({ navigation }: AuthStackScreenProps<'Registration'>) {
  const { accountType, markSignedUp, login, updateUser } = useAuthStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Load config based on account type
  const flowConfig: OnboardingFlow | undefined = ONBOARDING_CONFIG[accountType] || ONBOARDING_CONFIG['Customer'];

  const steps = flowConfig.steps;
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { step, data } = await authService.getOnboardingStatus();
        if (step > 0) {
          setCurrentStepIndex(step);
          if (data) setAnswers(data);
        }
      } catch (e) {
        console.log("Error fetching status", e);
      }
    };
    fetchProgress();
  }, []);

  const handleNext = async () => {
    // Validation
    for (const q of currentStep.questions) {
      if (q.required && !answers[q.id]) {
        Alert.alert("Missing Information", `Please answer: ${q.question}`);
        return;
      }
    }

    setLoading(true);
    try {
      const isFinal = currentStepIndex === steps.length - 1;
      if (currentStepIndex === 0) {
        // Update user name in store
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          updateUser({ ...currentUser, name: answers.fullName });
        }
      }

      await authService.updateOnboardingStep(
        currentStepIndex + 1,
        answers,
        undefined, // Role is handled by config logic or separate selection if needed, but strict based on accountType
        isFinal
      );

      if (isFinal) {
        // Prompt for Biometrics before finishing
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const hasEnrolled = await LocalAuthentication.isEnrolledAsync();

        const finish = async () => {
          await markSignedUp();
        };

        if (hasHardware && hasEnrolled) {
          Alert.alert(
            "Enable Biometrics",
            "Would you like to use FaceID / TouchID for faster login next time?",
            [
              { text: "No", style: "cancel", onPress: finish },
              {
                text: "Yes, Enable",
                onPress: async () => {
                  await useAuthStore.getState().enableBiometrics();
                  finish();
                }
              }
            ]
          );
        } else {
          await finish();
        }
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderQuestion = (q: Question) => {
    switch (q.type) {
      case 'text':
        return (
          <TextField
            key={q.id}
            label={q.question}
            placeholder={q.placeholder}
            value={answers[q.id] || ''}
            onChangeText={(text) => setAnswers(prev => ({ ...prev, [q.id]: text }))}
          />
        );
      case 'select':
        return (
          <View key={q.id} className="mb-4">
            <Text className="mb-2 text-sm font-medium text-ink-700">{q.question}</Text>
            <View className="flex-row flex-wrap gap-2">
              {q.options?.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  className={`px-4 py-2 rounded-full border ${answers[q.id] === opt ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'}`}
                >
                  <Text className={answers[q.id] === opt ? 'text-brand-700' : 'text-ink-700'}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 'multiselect':
        const selected = (answers[q.id] || []) as string[];
        const toggle = (opt: string) => {
          const newSelected = selected.includes(opt)
            ? selected.filter(s => s !== opt)
            : [...selected, opt];
          setAnswers(prev => ({ ...prev, [q.id]: newSelected }));
        };

        return (
          <View key={q.id} className="mb-4">
            <Text className="mb-2 text-sm font-medium text-ink-700">{q.question}</Text>
            <View className="flex-row flex-wrap gap-2">
              {q.options?.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => toggle(opt)}
                  className={`px-4 py-2 rounded-full border ${selected.includes(opt) ? 'bg-brand-50 border-brand-500' : 'bg-white border-ink-200'}`}
                >
                  <Text className={selected.includes(opt) ? 'text-brand-700' : 'text-ink-700'}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-ink-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12 pt-12"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-brand-500">
          Step {currentStepIndex + 1} of {steps.length}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-ink-900">
          {currentStep.title}
        </Text>

        <View className="mt-6 h-2 w-full rounded-full bg-ink-100">
          <View
            className="h-2 rounded-full bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </View>

        <View className="mt-8 space-y-6">
          {currentStep.questions.map(renderQuestion)}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 px-6 pb-8 pt-4">
        <View className="flex-row items-center justify-between">
          <SecondaryButton
            label="Back"
            onPress={handleBack}
            disabled={currentStepIndex === 0}
          />
          <PrimaryButton
            label={currentStepIndex === steps.length - 1 ? 'Submit' : 'Next'}
            onPress={handleNext}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton, TextField } from '../../components';
import { useAppState } from '../../store/appState';
import type { AuthStackScreenProps } from '../../navigation/types';

type RegistrationStep =
  | 'personal'
  | 'professional'
  | 'intent'
  | 'partner'
  | 'review';

export function RegistrationScreen({}: AuthStackScreenProps<'Registration'>) {
  const { accountType, markSignedUp, signIn } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    role: '',
    company: '',
    industry: '',
    intents: [] as string[],
    businessType: '',
    region: ''
  });

  const steps = useMemo(() => {
    const base: RegistrationStep[] = ['personal', 'professional', 'intent'];
    if (accountType !== 'Customer') {
      base.push('partner');
    }
    base.push('review');
    return base;
  }, [accountType]);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const intentOptions = [
    'Discover partnerships',
    'Find new leads',
    'Manage referrals',
    'Explore services'
  ];

  const toggleIntent = (intent: string) => {
    setForm((prev) => {
      const exists = prev.intents.includes(intent);
      return {
        ...prev,
        intents: exists
          ? prev.intents.filter((item) => item !== intent)
          : [...prev.intents, intent]
      };
    });
  };

  const handleNext = async () => {
    if (stepIndex === steps.length - 1) {
      await markSignedUp();
      signIn();
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <View className="flex-1 bg-ink-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12 pt-12"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-brand-500">
          Step {stepIndex + 1} of {steps.length}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-ink-900">
          {currentStep === 'personal' && 'Personal details'}
          {currentStep === 'professional' && 'Professional details'}
          {currentStep === 'intent' && 'Account intent'}
          {currentStep === 'partner' && 'Partner profile'}
          {currentStep === 'review' && 'Review & submit'}
        </Text>
        <Text className="mt-3 text-base text-ink-500">
          Answer a few quick questions so we can personalize your experience.
        </Text>

        <View className="mt-6 h-2 w-full rounded-full bg-ink-100">
          <View
            className="h-2 rounded-full bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </View>

        <View className="mt-8 space-y-6">
          {currentStep === 'personal' && (
            <>
              <TextField
                label="Full name"
                placeholder="Jordan Lee"
                value={form.fullName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, fullName: text }))
                }
              />
              <TextField
                label="Phone number"
                placeholder="+1 555 123 4567"
                value={form.phone}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, phone: text }))
                }
              />
              <TextField
                label="City"
                placeholder="San Francisco"
                value={form.city}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, city: text }))
                }
              />
            </>
          )}

          {currentStep === 'professional' && (
            <>
              <TextField
                label="Role / title"
                placeholder="Partnerships Lead"
                value={form.role}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, role: text }))
                }
              />
              <TextField
                label="Company name"
                placeholder="Rhythm Labs"
                value={form.company}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, company: text }))
                }
              />
              <TextField
                label="Industry"
                placeholder="Fintech, SaaS, Healthcare"
                value={form.industry}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, industry: text }))
                }
              />
            </>
          )}

          {currentStep === 'intent' && (
            <View>
              <Text className="mb-3 text-sm font-semibold text-ink-700">
                What are you looking for?
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {intentOptions.map((option) => {
                  const active = form.intents.includes(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => toggleIntent(option)}
                      className={[
                        'rounded-full border px-4 py-2',
                        active
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-ink-200 bg-white'
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'text-sm font-medium',
                          active ? 'text-brand-600' : 'text-ink-600'
                        ].join(' ')}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {currentStep === 'partner' && (
            <>
              <TextField
                label="Business type"
                placeholder="Agency, Consultancy, Marketplace"
                value={form.businessType}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, businessType: text }))
                }
              />
              <TextField
                label="Operating region"
                placeholder="North America"
                value={form.region}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, region: text }))
                }
              />
            </>
          )}

          {currentStep === 'review' && (
            <Card>
              <Text className="text-lg font-semibold text-ink-900">
                Review summary
              </Text>
              <Text className="mt-4 text-sm text-ink-500">
                Account type
              </Text>
              <Text className="text-base font-semibold text-ink-900">
                {accountType}
              </Text>
              <Text className="mt-4 text-sm text-ink-500">Name</Text>
              <Text className="text-base font-semibold text-ink-900">
                {form.fullName || '—'}
              </Text>
              <Text className="mt-4 text-sm text-ink-500">Company</Text>
              <Text className="text-base font-semibold text-ink-900">
                {form.company || '—'}
              </Text>
              <Text className="mt-4 text-sm text-ink-500">Intent</Text>
              <Text className="text-base font-semibold text-ink-900">
                {form.intents.length > 0 ? form.intents.join(', ') : '—'}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 px-6 pb-8 pt-4">
        <View className="flex-row items-center justify-between">
          <SecondaryButton
            label="Back"
            onPress={handleBack}
            disabled={stepIndex === 0}
          />
          <PrimaryButton
            label={stepIndex === steps.length - 1 ? 'Submit' : 'Next'}
            onPress={handleNext}
          />
        </View>
      </View>
    </View>
  );
}

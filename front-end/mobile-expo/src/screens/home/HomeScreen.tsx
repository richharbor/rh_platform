import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '../../components';
import { useAppState } from '../../store/appState';
import type { AppStackScreenProps } from '../../navigation/types';

export function HomeScreen({}: AppStackScreenProps<'Home'>) {
  const { signOut } = useAppState();

  return (
    <View className="flex-1 bg-ink-50">
      <ScrollView
        contentContainerClassName="px-6 pb-12 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-ink-500">
              Good morning
            </Text>
            <Text className="mt-1 text-3xl font-bold text-ink-900">
              Jordan 👋
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
            <Text className="text-lg font-semibold text-brand-600">JL</Text>
          </View>
        </View>

        <View className="mt-8 rounded-3xl bg-ink-900 px-6 py-6">
          <Text className="text-sm font-semibold text-brand-300">
            Complete your profile
          </Text>
          <Text className="mt-2 text-2xl font-semibold text-white">
            Unlock premium recommendations
          </Text>
          <Text className="mt-2 text-sm text-ink-200">
            Add your industry and partnership goals to tailor your workspace.
          </Text>
          <View className="mt-4">
            <PrimaryButton label="Finish setup" />
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-ink-900">
            Quick actions
          </Text>
          <View className="mt-4 space-y-4">
            {[
              { title: 'Explore services', subtitle: 'Browse curated partners.' },
              { title: 'Contact support', subtitle: 'Get help in minutes.' },
              { title: 'View insights', subtitle: 'Latest activity and trends.' }
            ].map((item) => (
              <View
                key={item.title}
                className="rounded-2xl bg-white px-5 py-4 shadow-soft"
              >
                <Text className="text-base font-semibold text-ink-900">
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm text-ink-500">
                  {item.subtitle}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-ink-900">
            Updates
          </Text>
          <View className="mt-4 space-y-4">
            {[
              'New partner match: Atlas Strategy',
              'Quarterly insights report is ready',
              'You have 3 new referral requests'
            ].map((item) => (
              <View
                key={item}
                className="rounded-2xl border border-ink-100 bg-white px-5 py-4"
              >
                <Text className="text-sm font-medium text-ink-700">{item}</Text>
                <Text className="mt-2 text-xs text-ink-400">2 hours ago</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-10">
          <PrimaryButton label="Sign out" fullWidth onPress={signOut} />
        </View>
      </ScrollView>

      <View className="border-t border-ink-100 bg-white px-6 pb-8 pt-3">
        <View className="flex-row items-center justify-between">
          {[
            { label: 'Home', active: true },
            { label: 'Search' },
            { label: 'Inbox' },
            { label: 'Profile' }
          ].map((item) => (
            <View key={item.label} className="items-center">
              <View
                className={[
                  'h-2 w-2 rounded-full',
                  item.active ? 'bg-brand-500' : 'bg-ink-200'
                ].join(' ')}
              />
              <Text
                className={[
                  'mt-2 text-xs font-medium',
                  item.active ? 'text-brand-600' : 'text-ink-400'
                ].join(' ')}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

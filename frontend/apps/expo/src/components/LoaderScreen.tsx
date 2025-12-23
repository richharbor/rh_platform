import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator } from 'react-native'
import { H2, Paragraph, YStack } from '@my/ui'

export function LoaderScreen() {
  return (
    <YStack flex={1} bg="$background">
      <LinearGradient
        colors={['#F8F4EC', '#EAF3FF', '#F3E7F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <YStack flex={1} justify="center" items="center" gap="$4">
          <YStack
            width={80}
            height={80}
            borderRadius={40}
            bg="$color1"
            borderWidth={1}
            borderColor="$color3"
            justify="center"
            items="center"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={12}
            shadowOffset={{ width: 0, height: 8 }}
          >
            <ActivityIndicator size="large" color="#0E2A47" />
          </YStack>
          <H2 color="$color12">Preparing your vault</H2>
          <Paragraph color="$color11">Securing your session and loading data.</Paragraph>
        </YStack>
      </SafeAreaView>
    </YStack>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
})

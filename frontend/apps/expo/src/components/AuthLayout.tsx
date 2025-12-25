import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { H1, Paragraph, Text, YStack } from '@my/ui'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <LinearGradient
        colors={['#F6F1E8', '#ECF4FF', '#F8EAF1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <YStack
        position="absolute"
        top={-90}
        right={-60}
        width={220}
        height={220}
        borderRadius={120}
        backgroundColor="#FFFFFF"
        opacity={0.35}
      />
      <YStack
        position="absolute"
        bottom={-70}
        left={-40}
        width={190}
        height={190}
        borderRadius={120}
        backgroundColor="#FFE6C7"
        opacity={0.35}
      />
      <SafeAreaView style={styles.safe}>
        <YStack flex={1} padding="$5" justifyContent="center">
          <YStack gap="$5">
            <YStack gap="$2">
              <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
                Richharbor
              </Text>
              <H1 color="$color12">{title}</H1>
              {subtitle ? (
                <Paragraph color="$color11" size="$4">
                  {subtitle}
                </Paragraph>
              ) : null}
            </YStack>
            <YStack
              backgroundColor="$color1"
              borderRadius="$8"
              padding="$5"
              gap="$4"
              borderWidth={1}
              borderColor="$color3"
              animation="medium"
              enterStyle={{ opacity: 0, y: 16 }}
              shadowColor="#000"
              shadowOpacity={0.08}
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 10 }}
            >
              {children}
            </YStack>
          </YStack>
          {footer ? <YStack marginTop="$5">{footer}</YStack> : null}
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

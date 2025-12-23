import { Platform, useColorScheme } from 'react-native'
import { ToastViewport } from './ToastViewport'
import { CustomToast, TamaguiProvider, type TamaguiProviderProps, ToastProvider, config } from '@my/ui'

// Tamagui dev polyfill causes React DevTools console patching warnings on native;
// only load it for web/Next.
if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@tamagui/polyfill-dev')
}

// Suppress native ExceptionsManager warning caused by DevTools mutation in production/dev client
if (Platform.OS !== 'web') {
  const originalError = console.error
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ExceptionsManager should be set up after React DevTools')) {
      return
    }
    originalError(...args)
  }
}

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

  return (
    <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
      <ToastProvider swipeDirection="horizontal" duration={6000} native={Platform.OS === 'web' ? [] : ['mobile']}>
        {children}
        <CustomToast />
        <ToastViewport />
      </ToastProvider>
    </TamaguiProvider>
  )
}

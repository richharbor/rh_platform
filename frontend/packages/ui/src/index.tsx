// Export only used pieces to avoid native DevTools mutation warnings
export {
  YStack,
  XStack,
  Button,
  Input,
  Switch,
  Select,
  Fieldset,
  Paragraph,
  Text,
  H1,
  H2,
  Separator,
  Theme,
  useTheme,
  styled,
  Stack,
  TamaguiProvider,
  type TamaguiProviderProps,
} from 'tamagui'

export { ToastProvider, Toast, useToastState } from '@tamagui/toast'

export { config } from '@my/config'

export * from './MyComponent'
export * from './CustomToast'
export * from './SwitchThemeButton'
export * from './SwitchRouterButton'

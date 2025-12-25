import { useMemo, useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, XStack, YStack } from '@my/ui'

import { AuthLayout } from '../src/components/AuthLayout'
import { getErrorMessage } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'

const emailRegex = /.+@.+\..+/

export default function SignupScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [role, setRole] = useState<'customer' | 'partner' | 'referral_partner'>('customer')
  const [pan, setPan] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [existingClientBase, setExistingClientBase] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isDisabled = loading || !email || !password || !confirmPassword || !name || !phone || !city

  const showPartnerFields = useMemo(() => role === 'partner', [role])

  const handleSubmit = async () => {
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp({
        email: trimmedEmail,
        password,
        name: name.trim() ? name.trim() : undefined,
        role,
        phone: phone.trim(),
        city: city.trim(),
        pan: pan.trim() || undefined,
        company_name: companyName.trim() || undefined,
        gst_number: gstNumber.trim() || undefined,
        experience_years: experienceYears.trim() || undefined,
        existing_client_base: existingClientBase.trim() || undefined,
      })
      router.replace('/home')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your Richharbor account"
      subtitle="Register once and unlock lead tracking, payouts, and referrals."
      footer={
        <XStack justify="center" gap="$2" items="center">
          <Text color="$color11">Already have an account?</Text>
          <Button
            chromeless
            onPress={() => router.replace('/login')}
            color="$color12"
            fontWeight="700"
          >
            Sign in
          </Button>
        </XStack>
      }
    >
      <YStack gap="$3">
        <YStack gap="$2">
          <Text color="$color11">Full name</Text>
          <Input
            value={name}
            onChangeText={(value) => {
              setName(value)
              if (error) setError('')
            }}
            placeholder="Prabhat Mehta"
            autoCapitalize="words"
            textContentType="name"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Mobile</Text>
          <Input
            value={phone}
            onChangeText={(value) => {
              setPhone(value)
              if (error) setError('')
            }}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">City</Text>
          <Input
            value={city}
            onChangeText={(value) => {
              setCity(value)
              if (error) setError('')
            }}
            placeholder="Mumbai"
            autoCapitalize="words"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Register as</Text>
          <XStack gap="$2" flexWrap="wrap">
            {[
              { value: 'customer', label: 'Customer' },
              { value: 'partner', label: 'Partner' },
              { value: 'referral_partner', label: 'Referral Partner' },
            ].map((option) => (
              <Button
                key={option.value}
                size="$3"
                bg={role === option.value ? '$blue10' : '$color2'}
                color={role === option.value ? 'white' : '$color12'}
                onPress={() => setRole(option.value as typeof role)}
              >
                {option.label}
              </Button>
            ))}
          </XStack>
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">PAN (optional)</Text>
          <Input
            value={pan}
            onChangeText={(value) => {
              setPan(value)
              if (error) setError('')
            }}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
          />
        </YStack>
        {showPartnerFields ? (
          <YStack gap="$3">
            <YStack gap="$2">
              <Text color="$color11">Company name</Text>
              <Input
                value={companyName}
                onChangeText={(value) => {
                  setCompanyName(value)
                  if (error) setError('')
                }}
                placeholder="Richharbor Advisory"
              />
            </YStack>
            <YStack gap="$2">
              <Text color="$color11">GST number</Text>
              <Input
                value={gstNumber}
                onChangeText={(value) => {
                  setGstNumber(value)
                  if (error) setError('')
                }}
                placeholder="22AAAAA0000A1Z5"
              />
            </YStack>
            <YStack gap="$2">
              <Text color="$color11">Experience (years)</Text>
              <Input
                value={experienceYears}
                onChangeText={(value) => {
                  setExperienceYears(value)
                  if (error) setError('')
                }}
                placeholder="5"
                keyboardType="number-pad"
              />
            </YStack>
            <YStack gap="$2">
              <Text color="$color11">Existing client base</Text>
              <Input
                value={existingClientBase}
                onChangeText={(value) => {
                  setExistingClientBase(value)
                  if (error) setError('')
                }}
                placeholder="50+"
              />
            </YStack>
          </YStack>
        ) : null}
        <YStack gap="$2">
          <Text color="$color11">Email</Text>
          <Input
            value={email}
            onChangeText={(value) => {
              setEmail(value)
              if (error) setError('')
            }}
            placeholder="you@richharbor.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCorrect={false}
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Password</Text>
          <Input
            value={password}
            onChangeText={(value) => {
              setPassword(value)
              if (error) setError('')
            }}
            placeholder="Minimum 8 characters"
            secureTextEntry
            textContentType="newPassword"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Confirm password</Text>
          <Input
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value)
              if (error) setError('')
            }}
            placeholder="Re-enter your password"
            secureTextEntry
            textContentType="password"
          />
        </YStack>
        <YStack gap="$2">
          <Paragraph color="$color10" size="$2">
            Richharbor is a technology platform connecting financial product partners. All transactions are subject
            to regulatory approvals and product terms.
          </Paragraph>
          <Paragraph color="$color10" size="$2">
            Investments in unlisted shares and pre-IPO offerings carry risks. Past performance does not guarantee
            future returns.
          </Paragraph>
        </YStack>
        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}
        <Button
          onPress={handleSubmit}
          disabled={isDisabled}
          bg="$color12"
          color="white"
          borderRadius="$6"
          pressStyle={{ opacity: 0.85 }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </YStack>
    </AuthLayout>
  )
}

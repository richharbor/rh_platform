import { useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { Button, Input, Paragraph, Text, XStack, YStack } from '@my/ui'

import { apiFetch, getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

const productOptions = [
  { value: 'unlisted_shares', label: 'Unlisted Shares' },
  { value: 'loans', label: 'Loans' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'private_markets', label: 'Private Markets' },
  { value: 'bulk_deals', label: 'Bulk Deals' },
  { value: 'corporate_finance', label: 'Corporate Finance' },
]

const leadTypes = [
  { value: 'self', label: 'Self', tip: 'Priority handling & free add-ons' },
  { value: 'partner', label: 'Partner', tip: 'Cash payout + contests' },
  { value: 'referral', label: 'Referral', tip: 'Gifts and vouchers' },
  { value: 'cold', label: 'Cold Reference', tip: 'Earn up to 25% payout' },
]

export default function CreateLeadScreen() {
  const { accessToken } = useAuth()
  const [productType, setProductType] = useState(productOptions[0].value)
  const [leadType, setLeadType] = useState(leadTypes[0].value)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [requirement, setRequirement] = useState('')
  const [productDetails, setProductDetails] = useState<Record<string, string>>({})
  const [convertToReferral, setConvertToReferral] = useState(false)
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const leadTip = useMemo(() => leadTypes.find((type) => type.value === leadType)?.tip ?? '', [leadType])

  const handleSubmit = async () => {
    setError('')
    if (!accessToken) {
      setError('Please log in to create a lead.')
      return
    }
    if (!name || !phone) {
      setError('Name and mobile are required.')
      return
    }
    if (leadType === 'cold' && !consentConfirmed) {
      setError('Consent confirmation is required for cold references.')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch<{ id: number }>('/v1/leads', {
        method: 'POST',
        token: accessToken,
        body: JSON.stringify({
          product_type: productType,
          lead_type: leadType,
          name,
          phone,
          email: email || undefined,
          city: city || undefined,
          requirement: requirement || undefined,
          product_details: productDetails,
          consent_confirmed: consentConfirmed,
          convert_to_referral: convertToReferral,
        }),
      })
      setSuccessId(response.id)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (successId) {
    return (
      <YStack flex={1} background="$background" padding="$5" gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$color12">
          Lead submitted 🎉
        </Text>
        <Paragraph color="$color11">Lead ID: {successId}</Paragraph>
        <Paragraph color="$color11">
          Next steps: Your RM will be assigned and tracking is now enabled. We will notify you as the
          lead moves through the pipeline.
        </Paragraph>
        <Button
          onPress={() => {
            setSuccessId(null)
            setName('')
            setPhone('')
            setEmail('')
            setCity('')
            setRequirement('')
            setProductDetails({})
            setConsentConfirmed(false)
            setConvertToReferral(false)
          }}
          background="$color12"
          color="white"
        >
          Submit another lead
        </Button>
      </YStack>
    )
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} background="$background" padding="$5" gap="$5">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$color12">
            Create a Lead
          </Text>
          <Paragraph color="$color11">Raise, refer, or monetize opportunities across Richharbor.</Paragraph>
        </YStack>

        <YStack gap="$3">
          <Text fontWeight="700" color="$color12">
            Step 1: Select product
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {productOptions.map((product) => (
              <Button
                key={product.value}
                size="$3"
                background={productType === product.value ? '$blue10' : '$color2'}
                color={productType === product.value ? 'white' : '$color12'}
                onPress={() => setProductType(product.value)}
              >
                {product.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontWeight="700" color="$color12">
            Step 2: Select lead type
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {leadTypes.map((type) => (
              <Button
                key={type.value}
                size="$3"
                background={leadType === type.value ? '$blue10' : '$color2'}
                color={leadType === type.value ? 'white' : '$color12'}
                onPress={() => setLeadType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </XStack>
          <Paragraph color="$color10" size="$2">
            {leadTip}
          </Paragraph>
        </YStack>

        <YStack gap="$3" background="$color1" borderRadius="$8" padding="$4" borderWidth={1} borderColor="$color3">
          <Text fontWeight="700" color="$color12">
            Step 3: Lead logic
          </Text>
          {leadType === 'self' ? (
            <YStack gap="$2">
              <Paragraph color="$color11">Convert this to a referral opportunity?</Paragraph>
              <Button
                onPress={() => setConvertToReferral((prev) => !prev)}
                background={convertToReferral ? '$blue10' : '$color2'}
                color={convertToReferral ? 'white' : '$color12'}
              >
                {convertToReferral ? 'Yes, convert' : 'Keep as self lead'}
              </Button>
              <Paragraph color="$color10" size="$2">
                Free add-ons auto-tagged: priority RM & faster callback.
              </Paragraph>
            </YStack>
          ) : null}
          {leadType === 'partner' ? (
            <Paragraph color="$color11">
              Partner code auto-attached. Expected payout and contest eligibility will appear after
              submission.
            </Paragraph>
          ) : null}
          {leadType === 'referral' ? (
            <Paragraph color="$color11">
              Gift and reward previews will show once the lead is verified.
            </Paragraph>
          ) : null}
          {leadType === 'cold' ? (
            <YStack gap="$2">
              <Button
                onPress={() => setConsentConfirmed((prev) => !prev)}
                background={consentConfirmed ? '$green10' : '$color2'}
                color={consentConfirmed ? 'white' : '$color12'}
              >
                {consentConfirmed ? 'Consent confirmed' : 'Confirm consent from lead'}
              </Button>
              <Paragraph color="$color10" size="$2">
                Earn up to 25% payout on successful conversion.
              </Paragraph>
            </YStack>
          ) : null}
        </YStack>

        <YStack gap="$3">
          <Text fontWeight="700" color="$color12">
            Step 4: Lead details
          </Text>
          <YStack gap="$2">
            <Text color="$color11">Name</Text>
            <Input value={name} onChangeText={setName} placeholder="Client name" />
          </YStack>
          <YStack gap="$2">
            <Text color="$color11">Mobile</Text>
            <Input value={phone} onChangeText={setPhone} placeholder="98765 43210" keyboardType="phone-pad" />
          </YStack>
          <YStack gap="$2">
            <Text color="$color11">Email</Text>
            <Input value={email} onChangeText={setEmail} placeholder="client@email.com" />
          </YStack>
          <YStack gap="$2">
            <Text color="$color11">City</Text>
            <Input value={city} onChangeText={setCity} placeholder="City" />
          </YStack>
          <YStack gap="$2">
            <Text color="$color11">Brief requirement</Text>
            <Input
              value={requirement}
              onChangeText={setRequirement}
              placeholder="Describe the requirement"
              multiline
            />
          </YStack>

          {productType === 'loans' ? (
            <YStack gap="$2">
              <Text color="$color11">Loan amount</Text>
              <Input
                value={productDetails.loan_amount || ''}
                onChangeText={(value) => setProductDetails((prev) => ({ ...prev, loan_amount: value }))}
                placeholder="₹25,00,000"
              />
            </YStack>
          ) : null}
          {productType === 'insurance' ? (
            <YStack gap="$2">
              <Text color="$color11">Insurance type</Text>
              <Input
                value={productDetails.insurance_type || ''}
                onChangeText={(value) => setProductDetails((prev) => ({ ...prev, insurance_type: value }))}
                placeholder="Life / Health / Motor"
              />
            </YStack>
          ) : null}
          {productType === 'unlisted_shares' ? (
            <YStack gap="$2">
              <Text color="$color11">Unlisted company name</Text>
              <Input
                value={productDetails.company_name || ''}
                onChangeText={(value) => setProductDetails((prev) => ({ ...prev, company_name: value }))}
                placeholder="Company name"
              />
            </YStack>
          ) : null}
          {productType === 'private_markets' ? (
            <YStack gap="$2">
              <Text color="$color11">Capital requirement</Text>
              <Input
                value={productDetails.capital_requirement || ''}
                onChangeText={(value) => setProductDetails((prev) => ({ ...prev, capital_requirement: value }))}
                placeholder="₹1,00,00,000"
              />
            </YStack>
          ) : null}
        </YStack>

        <YStack gap="$2">
          <Paragraph color="$color10" size="$2">
            Richharbor is a technology platform connecting financial product partners. All transactions are subject to
            regulatory approvals and product terms.
          </Paragraph>
          <Paragraph color="$color10" size="$2">
            Loans and insurance products are offered in partnership with regulated banks and insurers. Please read the
            full terms before proceeding.
          </Paragraph>
        </YStack>

        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}

        <Button onPress={handleSubmit} background="$color12" color="white" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Lead'}
        </Button>
      </YStack>
    </ScrollView>
  )
}

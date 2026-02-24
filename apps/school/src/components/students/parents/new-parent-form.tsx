import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { PhoneInput } from '@workspace/ui/components/phone-number'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Switch } from '@workspace/ui/components/switch'
import { useTranslations } from '@/i18n'

interface NewParentFormProps {
  firstName: string
  onFirstNameChange: (v: string) => void
  lastName: string
  onLastNameChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  email: string
  onEmailChange: (v: string) => void
  occupation: string
  onOccupationChange: (v: string) => void
  relationship: string
  onRelationshipChange: (v: any) => void
  isPrimary: boolean
  onIsPrimaryChange: (v: boolean) => void
  canPickup: boolean
  onCanPickupChange: (v: boolean) => void
  receiveNotifications: boolean
  onReceiveNotificationsChange: (v: boolean) => void
}

export function NewParentForm({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  occupation,
  onOccupationChange,
  relationship,
  onRelationshipChange,
  isPrimary,
  onIsPrimaryChange,
  canPickup,
  onCanPickupChange,
  receiveNotifications,
  onReceiveNotificationsChange,
}: NewParentFormProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {t.parents.lastName()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input value={lastName} onChange={e => onLastNameChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t.parents.firstName()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input value={firstName} onChange={e => onFirstNameChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t.parents.phone()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <PhoneInput value={phone} onChange={v => onPhoneChange(v || '')} defaultCountry="CI" />
        </div>
        <div className="space-y-2">
          <Label>{t.parents.email()}</Label>
          <Input value={email} onChange={e => onEmailChange(e.target.value)} type="email" />
        </div>
        <div className="space-y-2">
          <Label>
            {t.parents.relationship()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Select value={relationship} onValueChange={onRelationshipChange}>
            <SelectTrigger>
              <SelectValue placeholder={t.parents.relationship()}>
                {((t.parents as any)[`relationship${relationship.charAt(0).toUpperCase() + relationship.slice(1)}`])?.() ?? relationship}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'].map(r => (
                <SelectItem key={r} value={r}>
                  {((t.parents as any)[`relationship${r.charAt(0).toUpperCase() + r.slice(1)}`])?.() ?? r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.parents.occupation()}</Label>
          <Input value={occupation} onChange={e => onOccupationChange(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center space-x-2">
          <Switch checked={isPrimary} onCheckedChange={onIsPrimaryChange} />
          <Label className="cursor-pointer" onClick={() => onIsPrimaryChange(!isPrimary)}>Primary contact</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={canPickup} onCheckedChange={onCanPickupChange} />
          <Label className="cursor-pointer" onClick={() => onCanPickupChange(!canPickup)}>Can pick up</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={receiveNotifications} onCheckedChange={onReceiveNotificationsChange} />
          <Label className="cursor-pointer" onClick={() => onReceiveNotificationsChange(!receiveNotifications)}>Receives notifications</Label>
        </div>
      </div>
    </div>
  )
}

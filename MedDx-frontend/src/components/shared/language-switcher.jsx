import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { SUPPORTED_LANGUAGES } from '@/i18n'

const LanguageSwitcher = ({ variant = 'sidebar' }) => {
  const { i18n, t } = useTranslation()
  const current = i18n.language

  return (
    <div
      className={
        variant === 'sidebar'
          ? 'flex items-center gap-2 px-1 py-1 rounded-lg group-data-[collapsible=icon]:hidden'
          : 'flex items-center gap-2'
      }
    >
      <Languages className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Select
        value={current}
        onValueChange={(v) => i18n.changeLanguage(v)}
      >
        <SelectTrigger className="h-7 rounded-full text-[11px] bg-card border-border flex-1 data-[size=default]:h-7">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((code) => (
            <SelectItem key={code} value={code} className="text-xs">
              {t(`language.${code}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSwitcher

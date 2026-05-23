import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { useAddAshaPatient } from '@/apis'
import { errorToast } from '@/lib'

const empty = () => ({
  name: '',
  age: '',
  gender: 'prefer_not_to_say',
  phone: '',
  language: 'hi',
  village: '',
  notes: '',
})

const AddVillagerDialog = ({ defaultVillage }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { addPatient, isLoading } = useAddAshaPatient({
    onSuccess: () => {
      setForm(empty())
      setOpen(false)
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (name.length < 2) {
      return errorToast({ message: t('asha.add.name_required') })
    }
    addPatient({
      data: {
        name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        phone: form.phone.trim() || undefined,
        language: form.language,
        village: form.village.trim() || defaultVillage || undefined,
        notes: form.notes.trim() || undefined,
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setForm(empty())
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5">
          <Plus className="h-4 w-4" />
          {t('asha.add.cta')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {t('asha.add.title')}
          </DialogTitle>
          <DialogDescription>{t('asha.add.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
              {t('asha.add.full_name')}
            </Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('asha.add.full_name_placeholder')}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
                {t('asha.add.age')}
              </Label>
              <Input
                type="number"
                min={0}
                max={130}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="32"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
                {t('asha.add.gender')}
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v })}
              >
                <SelectTrigger className="h-11 rounded-xl data-[size=default]:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">
                    {t('triage.sex_male')}
                  </SelectItem>
                  <SelectItem value="female">
                    {t('triage.sex_female')}
                  </SelectItem>
                  <SelectItem value="other">
                    {t('triage.sex_other')}
                  </SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    {t('triage.sex_skip')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
                {t('asha.add.phone')}
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9999 999 999"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
                {t('asha.add.language')}
              </Label>
              <Select
                value={form.language}
                onValueChange={(v) => setForm({ ...form, language: v })}
              >
                <SelectTrigger className="h-11 rounded-xl data-[size=default]:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="mr">मराठी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
              {t('asha.add.village')}
            </Label>
            <Input
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              placeholder={defaultVillage || t('asha.add.village_placeholder')}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">
              {t('asha.add.notes')}
            </Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('asha.add.notes_placeholder')}
              className="rounded-xl resize-none"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5"
            >
              {isLoading ? <Spinner /> : <Plus className="h-4 w-4" />}
              {t('asha.add.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddVillagerDialog

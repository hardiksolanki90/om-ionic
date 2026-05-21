import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { Layers } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { PageLayout } from '../../layouts/PageLayout'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'
import { useCategory, useCreateCategory, useUpdateCategory } from '../../hooks/useCategories'
import { isCategoryActive, type CategoryForm as CategoryFormType } from '../../types/category'

const EMPTY: CategoryFormType = { name: '', code: '', tax: '', status: true }

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useCategory(isEdit ? id! : '')
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const [form, setForm] = useState<CategoryFormType>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: codeSettings } = useCodeSettings('category')
  const isAuto = codeSettings?.is_auto

  const { data: previewData } = useCodePreview('category', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && previewData?.code) {
      setForm(prev => ({ ...prev, code: previewData.code! }))
    }
  }, [isEdit, isAuto, previewData])

  useEffect(() => {
    if (isEdit && data?.item) {
      const c = data.item
      setForm({ name: c.name ?? '', code: c.code ?? '', tax: c.tax ?? '', status: isCategoryActive(c.status) })
    }
  }, [data, isEdit])

  const set = (k: keyof CategoryFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || (!isAuto && !form.code)) {
      present({ message: 'Name and code are required.', duration: 2500, position: 'top', color: 'danger' })
      return
    }
    setSaving(true)
    try {
      if (isEdit && data?.item?.uuid) {
        await updateCategory.mutateAsync({ uuid: data.item.uuid, data: form })
        present({ message: 'Category updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createCategory.mutateAsync(form)
        present({ message: 'Category created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/categories')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || 'Failed to save category.', duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading category…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/categories')}
        title={isEdit ? 'Edit Category' : 'New Category'}
        subtitle={isEdit ? 'Update category details' : 'Create a new item category'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/categories')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          <section className="border p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Layers className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Category Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Category Code"
                required={!isAuto}
                placeholder={isAuto ? 'Auto-generated' : 'e.g. ELEC'}
                value={(!isEdit && isAuto) ? (previewData?.code || 'Generating...') : form.code}
                onChange={set('code')}
                disabled={!isEdit && isAuto}
                onSettingsClick={() => setSettingsOpen(true)}
              />
              <Input label="Category Name" required value={form.name} onChange={set('name')} placeholder="e.g. Electronics" />
              <Input label="Tax (%)" value={form.tax} onChange={set('tax')} placeholder="e.g. 18" />
            </div>
          </section>
        </div>
      </SlidePanel>

      <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} component="category" title="Category Code" />
    </PageLayout>
  )
}

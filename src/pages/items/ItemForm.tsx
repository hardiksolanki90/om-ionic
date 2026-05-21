import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import { CloudUpload, Trash2, Plus, X, Package, Ruler, Info, ChevronDown } from 'lucide-react'
import { SlidePanel } from '../../components/ui/SlidePanel'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { StatusSwitch } from '../../components/ui/StatusSwitch'
import { cn } from '../../lib/cn'
import { PageLayout } from '../../layouts/PageLayout'
import { ItemForm as ItemFormType, SecondaryUom } from '../../types/item'
import { CategoryPickerModal } from '../../components/CategoryPickerModal'
import { BrandPickerModal } from '../../components/BrandPickerModal'
import { UomPickerModal } from '../../components/UomPickerModal'
import { useItem, useCreateItem, useUpdateItem } from '../../hooks/useItems'
import { CodeSettingsModal } from '../../components/ui/CodeSettingsModal'
import { useCodeSettings, useCodePreview } from '../../hooks/useCodeSetting'

const getEmptyForm = (): ItemFormType => ({
  itemCode: '',
  itemName: '',
  description: '',
  itemPrice: '',
  brandId: '',
  categoryId: '',
  image: '',
  status: 1,
  baseUom: '',
  baseUpc: '',
  secondaryUoms: [],
})

export default function ItemForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [present] = useIonToast()

  const { data, isLoading } = useItem(isEdit ? (id ?? '') : '')
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()

  const [form, setForm] = useState<ItemFormType>(getEmptyForm())
  const [names, setNames] = useState({ category: '', brand: '', baseUom: '' })

  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormType, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openModal, setOpenModal] = useState<'category' | 'brand' | null>(null)
  const [openUomFor, setOpenUomFor] = useState<'base' | string | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [showSettings, setShowSettings] = useState(false)
  const { data: codeSettings } = useCodeSettings('item')
  const isAuto = codeSettings?.is_auto

  const { data: generatedCode } = useCodePreview('item', !isEdit && isAuto)

  useEffect(() => {
    if (!isEdit && isAuto && generatedCode?.code) {
      setForm(prev => ({ ...prev, itemCode: generatedCode.code! }))
    }
  }, [isEdit, isAuto, generatedCode])

  useEffect(() => {
    if (isEdit && data?.data) {
      const item = data.data
      setForm({
        itemCode: item.code ?? '',
        itemName: item.name ?? '',
        description: item.description ?? '',
        itemPrice: item.price ?? '',
        brandId: item.brandId ?? '',
        categoryId: item.categoryId ?? '',
        image: item.image ?? '',
        status: item.status ?? 1,
        baseUom: item.baseUomId ?? '',
        baseUpc: item.baseUpc ?? '',
        secondaryUoms: item.secondaryUoms ?? [],
      })
      setNames({
        category: item.categoryName ?? '',
        brand: item.brandName ?? '',
        baseUom: item.baseUomName ?? '',
      })
    }
  }, [data, isEdit])

  const onChange = (field: keyof ItemFormType, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof ItemFormType, string>> = {}
    if (!isAuto && !form.itemCode) newErrors.itemCode = 'Item code is required'
    if (!form.itemName) newErrors.itemName = 'Item name is required'
    if (!form.itemPrice) newErrors.itemPrice = 'Price is required'
    if (!form.categoryId) newErrors.categoryId = 'Category is required'
    if (!form.brandId) newErrors.brandId = 'Brand is required'
    if (!form.baseUom) newErrors.baseUom = 'Base UOM is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (isEdit) {
        if (!data?.data?.uuid) return
        await updateItem.mutateAsync({ uuid: data.data.uuid, data: form })
        present({ message: 'Item updated.', duration: 2500, position: 'top', color: 'success' })
      } else {
        await createItem.mutateAsync(form)
        present({ message: 'Item created.', duration: 2500, position: 'top', color: 'success' })
      }
      navigate('/items')
    } catch (err: any) {
      present({ message: err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} item.`, duration: 3000, position: 'top', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange('image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSecondaryUom = () => {
    const newUoms = [
      ...form.secondaryUoms,
      { id: Date.now().toString(), uomId: '', upc: '' }
    ]
    onChange('secondaryUoms', newUoms)
  }

  const removeSecondaryUom = (id: string) => {
    onChange('secondaryUoms', (form.secondaryUoms ?? []).filter(u => String(u.id) !== id))
  }

  const updateSecondaryUom = (id: string, field: keyof SecondaryUom, value: string) => {
    const newUoms = (form.secondaryUoms ?? []).map(u =>
      String(u.id) === id ? { ...u, [field]: value } : u
    )
    onChange('secondaryUoms', newUoms)
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout noScroll>
        <div className="flex items-center justify-center h-full text-slate-500">Loading item…</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout noScroll>
      <SlidePanel
        isOpen
        onClose={() => navigate('/items')}
        title={isEdit ? 'Edit Item' : 'Add Item'}
        width="full"
        pageMode
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusSwitch
              value={form.status === 1}
              onChange={v => onChange('status', v ? 1 : 0)}
            />
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/items')} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-8 pb-10">
          {/* Basic Information Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <Info className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Basic Information</h3>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group relative",
                    form.image ? "border-brand-500" : "border-slate-200 dark:border-slate-700 hover:border-brand-300 bg-slate-50 dark:bg-slate-800/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.image ? (
                    <>
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CloudUpload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <CloudUpload className="w-8 h-8 text-slate-300 group-hover:text-brand-400 mb-2 transition-colors" />
                      <p className="text-[10px] font-medium text-slate-400 text-center px-2">Click to upload image</p>
                    </div>
                  )}
                </div>
                {form.image && (
                  <button
                    onClick={() => onChange('image', '')}
                    className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove image
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <div className="flex-1 space-y-4">
                <Input
                  label="Item Code"
                  placeholder="e.g. SKU-12345"
                  value={(!isEdit && isAuto) ? (generatedCode?.code || 'Generating...') : form.itemCode}
                  onChange={e => onChange('itemCode', e.target.value)}
                  error={errors.itemCode}
                  required={!isAuto}
                  disabled={!isEdit && isAuto}
                  onSettingsClick={() => setShowSettings(true)}
                />
                <Input
                  label="Item Name"
                  placeholder="Full descriptive product name"
                  value={form.itemName}
                  onChange={e => onChange('itemName', e.target.value)}
                  error={errors.itemName}
                  required
                />
              </div>
            </div>

            <Textarea
              label="Description"
              placeholder="Technical details, features, etc."
              rows={3}
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setOpenModal('category')}
                  className={cn(
                    'h-9 w-full rounded-lg border px-3 text-sm text-left flex items-center justify-between',
                    'bg-white dark:bg-slate-900 transition-colors duration-150 ring-1 ring-slate-300 dark:ring-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                    errors.categoryId
                      ? 'border-red-400 dark:border-red-500/50'
                      : 'border-slate-300 dark:border-slate-700',
                    !names.category && 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  <span>{names.category || 'Select Category'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
              </div>

              {/* Brand picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Brand <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setOpenModal('brand')}
                  className={cn(
                    'h-9 w-full rounded-lg border px-3 text-sm text-left flex items-center justify-between',
                    'bg-white dark:bg-slate-900 transition-colors duration-150 ring-1 ring-slate-300 dark:ring-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                    errors.brandId
                      ? 'border-red-400 dark:border-red-500/50'
                      : 'border-slate-300 dark:border-slate-700',
                    !names.brand && 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  <span>{names.brand || 'Select Brand'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
                {errors.brandId && <p className="text-xs text-red-500">{errors.brandId}</p>}
              </div>
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.itemPrice}
                onChange={e => onChange('itemPrice', e.target.value)}
                error={errors.itemPrice}
                required
              />
            </div>
          </section>

          {/* Units of Measure Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <Package className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Units of Measure</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <Ruler className="w-3 h-3" /> Base Unit Configuration
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Base UOM <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenUomFor('base')}
                    className={cn(
                      'h-9 w-full rounded-lg border px-3 text-sm text-left flex items-center justify-between',
                      'bg-white dark:bg-slate-900 transition-colors duration-150 ring-1 ring-slate-300 dark:ring-slate-700',
                      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
                      errors.baseUom ? 'border-red-400 dark:border-red-500/50' : 'border-slate-300 dark:border-slate-700',
                      !names.baseUom && 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    <span>{names.baseUom || 'Select Unit'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                  {errors.baseUom && <p className="text-xs text-red-500">{errors.baseUom}</p>}
                </div>
                <Input
                  label="Base UPC"
                  placeholder="000000000000"
                  value={form.baseUpc}
                  onChange={e => onChange('baseUpc', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  Secondary Units <Badge variant="neutral" className="ml-2 font-mono">{(form.secondaryUoms ?? []).length}</Badge>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3 h-3" />}
                  onClick={addSecondaryUom}
                  className="h-7 text-[10px] bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30"
                >
                  Add Unit
                </Button>
              </div>

              {(form.secondaryUoms ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
                  <Package className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">No secondary units added for this item.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(form.secondaryUoms ?? []).map((uom, idx) => (
                    <div key={uom.id} className="group relative flex gap-3 p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-brand-400 transition-colors" />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">UOM {idx + 1}</label>
                          <button
                            type="button"
                            onClick={() => setOpenUomFor(String(uom.id))}
                            className={cn(
                              'h-8 w-full rounded-lg border px-3 text-sm text-left flex items-center justify-between ring-1 ring-slate-300 dark:ring-slate-700',
                              'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700',
                              'focus:outline-none focus:ring-2 focus:ring-brand-500',
                              !uom.uomName && 'text-slate-400 dark:text-slate-500'
                            )}
                          >
                            <span>{uom.uomName || 'Select UOM'}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          </button>
                        </div>
                        <Input
                          label="UPC"
                          value={uom.upc}
                          onChange={e => updateSecondaryUom(String(uom.id), 'upc', e.target.value)}
                          placeholder="UPC Code"
                          className="h-8"
                        />
                      </div>
                      <button
                        onClick={() => removeSecondaryUom(String(uom.id))}
                        className="self-end mb-1 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <CategoryPickerModal
          isOpen={openModal === 'category'}
          onClose={() => setOpenModal(null)}
          onSelect={(id, name) => {
            onChange('categoryId', id)
            setNames(prev => ({ ...prev, category: name }))
            setErrors(prev => ({ ...prev, categoryId: undefined }))
          }}
          selectedId={form.categoryId ? Number(form.categoryId) : undefined}
        />

        <BrandPickerModal
          isOpen={openModal === 'brand'}
          onClose={() => setOpenModal(null)}
          onSelect={(id, name) => {
            onChange('brandId', id)
            setNames(prev => ({ ...prev, brand: name }))
            setErrors(prev => ({ ...prev, brandId: undefined }))
          }}
          selectedId={form.brandId ? Number(form.brandId) : undefined}
        />

        <UomPickerModal
          isOpen={openUomFor !== null}
          onClose={() => setOpenUomFor(null)}
          onSelect={(id, name) => {
            if (openUomFor === 'base') {
              onChange('baseUom', id)
              setNames(prev => ({ ...prev, baseUom: name }))
              setErrors(prev => ({ ...prev, baseUom: undefined }))
            } else if (openUomFor !== null) {
              const updated = (form.secondaryUoms ?? []).map(u =>
                String(u.id) === openUomFor ? { ...u, uomId: id, uomName: name } : u
              )
              onChange('secondaryUoms', updated)
            }
            setOpenUomFor(null)
          }}
          selectedId={
            openUomFor === 'base'
              ? form.baseUom ? Number(form.baseUom) : undefined
              : (form.secondaryUoms ?? []).find(u => String(u.id) === openUomFor)?.uomId
                ? Number((form.secondaryUoms ?? []).find(u => String(u.id) === openUomFor)?.uomId)
                : undefined
          }
        />

        <CodeSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          component="item"
          title="Item"
        />
      </SlidePanel>
    </PageLayout>
  )
}

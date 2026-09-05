import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

const DAY_OPTIONS = [1, 2, 3, 5, 7]
const CATEGORY_ACCENTS = ['#ec4899', '#d89b00', '#3b82f6', '#f97316', '#15803d']

function accentFor(category: string) {
  if (category === 'General Pantry') return '#15803d'
  return CATEGORY_ACCENTS[category.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % CATEGORY_ACCENTS.length]
}

function quantityText(item: any) {
  const raw = item.quantity ?? item.total_quantity
  const number = Number(raw)
  const value = Number.isFinite(number) ? (Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/\.?0+$/, '')) : String(raw ?? '')
  return value + (item.unit ? ` ${item.unit}` : '')
}

export function CartPage() {
  const [days, setDays] = useState(7)
  const [checkedIds, setCheckedIds] = useState<number[]>([])
  const query = useQuery({ queryKey: ['cart', days], queryFn: async () => (await api.cart.get(days)).data })
  const data: any = query.data
  const items: any[] = useMemo(() => Array.isArray(data) ? data : data?.items || data?.ingredients || data?.data || [], [data])
  const totalCount = items.length
  const checkedCount = items.filter(item => checkedIds.includes(Number(item.ingredient_id ?? item.id))).length
  const progress = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {}
    items.forEach(item => {
      const category = item.category_name || 'General Pantry'
      if (!groups[category]) groups[category] = []
      groups[category].push(item)
    })
    return groups
  }, [items])

  const toggle = (item: any) => {
    const id = Number(item.ingredient_id ?? item.id)
    setCheckedIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }

  return <div className="mx-auto max-w-5xl">
    <h1 className="font-display text-4xl md:text-5xl">Cart</h1>

    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#15803d]/10 text-[#15803d]">▣</div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#132238]">Shopping period</h2>
            <p className="text-xs text-slate-500">Choose your planning window</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid h-9 min-w-9 place-items-center rounded-full bg-[#15803d]/10 px-2 text-xs font-extrabold text-[#15803d]">{progress}%</span>
          {checkedCount > 0 && <button type="button" onClick={() => setCheckedIds([])} className="rounded-xl border border-slate-200 bg-[#f7faf7] px-3 py-2 text-xs font-bold text-slate-500">↻ Reset</button>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {DAY_OPTIONS.map(option => <button key={option} type="button" disabled={query.isFetching} onClick={() => setDays(option)} className={`rounded-xl border px-2 py-2.5 transition ${days === option ? 'border-[#15803d] bg-[#15803d] text-white shadow-sm' : 'border-slate-200 bg-[#f7faf7] text-[#132238]'} ${query.isFetching && days !== option ? 'opacity-40' : ''}`}><span className="block text-sm font-extrabold">{option}</span><span className="block text-[9px] font-bold opacity-80">{option === 1 ? 'day' : 'days'}</span></button>)}
      </div>

      {totalCount > 0 && <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#15803d] transition-all" style={{ width: `${progress}%` }} /></div>}
      {query.isFetching && !query.isLoading && <p className="mt-3 text-center text-xs font-semibold text-[#15803d]">Updating list...</p>}
    </section>

    <div className="mt-6">
      {query.isLoading ? <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />)}</div> : items.length ? Object.entries(grouped).map(([category, categoryItems]) => {
        const accent = accentFor(category)
        const categoryChecked = categoryItems.filter(item => checkedIds.includes(Number(item.ingredient_id ?? item.id))).length
        const categoryDone = categoryChecked === categoryItems.length
        return <section key={category} className="mb-7">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="min-w-0"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} /><h2 className="truncate text-sm font-extrabold text-[#132238]">{category}</h2>{categoryDone && category !== 'General Pantry' && <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] text-white" style={{ backgroundColor: accent }}>✓</span>}</div><p className="mt-1 pl-4 text-[10px] font-semibold text-slate-400">{categoryChecked} of {categoryItems.length} checked</p></div>
            <span className="grid h-7 min-w-7 place-items-center rounded-lg border px-2 text-xs font-extrabold" style={{ backgroundColor: categoryDone && category !== 'General Pantry' ? accent : `${accent}14`, borderColor: `${accent}35`, color: categoryDone && category !== 'General Pantry' ? '#fff' : accent }}>{categoryItems.length}</span>
          </div>
          {category !== 'General Pantry' && categoryChecked > 0 && !categoryDone && <div className="mb-2 ml-4 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${Math.round(categoryChecked / categoryItems.length * 100)}%`, backgroundColor: accent }} /></div>}
          <div className="space-y-2">{categoryItems.map((item: any, index: number) => { const id = Number(item.ingredient_id ?? item.id ?? index); const checked = checkedIds.includes(id); return <button type="button" key={id} onClick={() => toggle(item)} className={`flex min-h-[62px] w-full items-center justify-between gap-3 rounded-2xl bg-white px-3.5 py-3 text-left shadow-sm ring-1 ring-black/5 transition ${checked ? 'opacity-70' : ''}`}><span className="flex min-w-0 flex-1 items-center gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border-[1.5px]" style={{ backgroundColor: checked ? accent : 'transparent', borderColor: checked ? accent : `${accent}88` }}>{checked && <span className="text-xs font-black text-white">✓</span>}</span><span className={`min-w-0 text-sm font-bold ${checked ? 'text-slate-400 line-through' : 'text-[#132238]'}`}>{item.name || item.ingredient_name || 'Unnamed ingredient'}</span></span><span className="flex min-h-[34px] shrink-0 items-center justify-center rounded-xl border px-2.5 text-xs font-extrabold" style={{ backgroundColor: checked ? '#f7faf7' : `${accent}10`, borderColor: checked ? '#e2e8e3' : `${accent}35`, color: checked ? '#7a8694' : accent }}>{quantityText(item)}</span></button> })}</div>
        </section>
      }) : <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5"><div className="text-4xl">🛒</div><h2 className="mt-4 font-display text-2xl">Your cart is clear</h2><p className="mt-2 text-sm text-slate-500">Ingredients generated from your recipes will show up here.</p></div>}
    </div>
  </div>
}

import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function CartPage() {
  const query = useQuery({ queryKey: ['cart'], queryFn: async () => (await api.cart.get()).data })
  const data: any = query.data
  const items = Array.isArray(data) ? data : data?.items || data?.ingredients || data?.data || []
  return <div className="mx-auto max-w-5xl"><p className="text-xs font-bold tracking-[.25em] text-sage">KITCHEN LIST</p><h1 className="mt-2 font-display text-4xl md:text-5xl">Cart</h1><p className="mt-2 text-slate-500">Everything you need for the next few days.</p><div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">{query.isLoading ? <div className="p-10 text-slate-500">Loading your cart…</div> : items.length ? <div className="divide-y divide-black/5">{items.map((item: any, i: number) => <div key={item.id ?? i} className="flex items-center justify-between px-6 py-5"><div><p className="font-semibold">{item.name || item.ingredient_name || 'Ingredient'}</p><p className="mt-1 text-xs text-slate-400">{item.quantity ? `${item.quantity} ${item.unit || ''}` : 'Needed for your recipes'}</p></div><span className="h-5 w-5 rounded-full border-2 border-sage" /></div>)}</div> : <div className="p-12 text-center"><div className="text-4xl">🛒</div><h2 className="mt-4 font-display text-2xl">Your cart is clear</h2><p className="mt-2 text-sm text-slate-500">Ingredients generated from your recipes will show up here.</p></div>}</div></div>
}

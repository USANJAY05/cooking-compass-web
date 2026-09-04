import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import toast from 'react-hot-toast'

type Recipe = { id?: number; title?: string; name?: string; description?: string; image_url?: string; prep_time?: number; cook_time?: number; category?: { name?: string } | string }

export function RecipesPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['recipes', search], queryFn: async () => (search ? api.recipes.search(search) : api.recipes.list()).then(r => r.data) })
  const recipes: Recipe[] = Array.isArray(query.data) ? query.data : query.data?.items || query.data?.data || []

  return <div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold tracking-[.25em] text-sage">DISCOVER</p><h1 className="font-display text-4xl md:text-5xl">Recipes for your kitchen.</h1><p className="mt-2 text-slate-500">Find something worth cooking today.</p></div><div className="relative w-full md:w-80"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes..." className="w-full rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm outline-none ring-moss/20 focus:ring-4" /></div></div>
    {query.isLoading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-72 animate-pulse rounded-3xl bg-white" />)}</div>}
    {query.isError && <div className="rounded-3xl bg-white p-8 text-center"><p className="font-semibold">Could not load recipes.</p><p className="mt-2 text-sm text-slate-500">Check your API URL and authentication.</p><button onClick={() => query.refetch()} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Try again</button></div>}
    {!query.isLoading && !query.isError && recipes.length === 0 && <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 p-14 text-center"><div className="text-4xl">🍲</div><h2 className="mt-4 font-display text-2xl">No recipes yet</h2><p className="mt-2 text-sm text-slate-500">Your recipe collection will appear here.</p></div>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recipes.map((recipe, index) => <article key={recipe.id ?? index} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex h-48 items-center justify-center overflow-hidden bg-[#e8e4d8]">{recipe.image_url ? <img src={recipe.image_url} alt={recipe.title || recipe.name || 'Recipe'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <span className="text-6xl">🥗</span>}</div><div className="p-5"><div className="flex items-center justify-between"><span className="rounded-full bg-[#edf1e9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-moss">{typeof recipe.category === 'string' ? recipe.category : recipe.category?.name || 'Recipe'}</span>{recipe.prep_time && <span className="text-xs text-slate-400">{recipe.prep_time} min</span>}</div><h2 className="mt-4 font-display text-2xl">{recipe.title || recipe.name || 'Untitled recipe'}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{recipe.description || 'A recipe ready for your kitchen.'}</p><button onClick={() => toast('Recipe details coming next.')} className="mt-5 text-sm font-bold text-moss">View recipe →</button></div></article>)}</div>
  </div>
}

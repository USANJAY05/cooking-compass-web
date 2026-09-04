import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function RoutinePage() {
  const query = useQuery({ queryKey: ['routines'], queryFn: async () => (await api.routines.list()).data })
  const routines = Array.isArray(query.data) ? query.data : query.data?.items || query.data?.data || []
  return <div className="mx-auto max-w-7xl"><p className="text-xs font-bold tracking-[.25em] text-sage">YOUR RHYTHM</p><h1 className="mt-2 font-display text-4xl md:text-5xl">Routine</h1><p className="mt-2 text-slate-500">Plan the meals and habits that keep your kitchen moving.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{query.isLoading ? [1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-3xl bg-white" />) : routines.length ? routines.map((r: any, i: number) => <div key={r.id ?? i} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"><span className="text-xs font-bold text-sage">ROUTINE {String(i + 1).padStart(2,'0')}</span><h2 className="mt-3 font-display text-2xl">{r.name || r.title || 'Weekly routine'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{r.description || 'Keep your cooking consistent with a simple repeatable plan.'}</p></div>) : <div className="rounded-3xl bg-white p-10 md:col-span-2 lg:col-span-3"><h2 className="font-display text-2xl">No routines yet</h2><p className="mt-2 text-slate-500">Your routines will appear here once they are available from the backend.</p></div>}</div></div>
}

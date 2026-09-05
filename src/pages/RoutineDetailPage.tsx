import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

type AnyRecord = Record<string, any>
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function displayDate(value: any) { if (!value) return ''; const d = new Date(value); return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }

export function RoutineDetailPage() {
  const { routineId } = useParams()
  const navigate = useNavigate()
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const query = useQuery({ queryKey: ['routine-detail', routineId], queryFn: async () => (await api.routines.get(routineId!)).data, enabled: !!routineId })
  const routine: AnyRecord | undefined = query.data?.data ?? query.data?.routine ?? query.data

  if (query.isLoading) return <div className="detail-loading"><div className="detail-spinner" /><p>Loading routine…</p></div>
  if (query.isError || !routine) return <div className="detail-error"><div className="detail-error-icon">!</div><h2>Couldn’t load routine</h2><p>Please try again.</p><button onClick={() => query.refetch()}>Retry</button></div>

  const recurrence = routine.recurrence ?? {}
  const frequency = recurrence.frequency || 'WEEKLY'
  const specificDate = recurrence.specific_date || recurrence.type === 'SPECIFIC_DATE' || frequency === 'SPECIFIC_DATE'
  const days = recurrence.days_of_week ?? []
  const recipes = routine.recipes ?? []
  const description = String(routine.description ?? '').trim()
  const canExpand = description.length > 140

  return <div className="detail-page routine-detail-page">
    <section className="routine-detail-header routine-hero-card">
      <div className="routine-hero-copy">
        <p className="detail-eyebrow">ROUTINE</p>
        <h2>{routine.name || routine.title || 'Routine'}</h2>
        {description ? <div className="routine-description-wrap">
          <p className={`detail-description routine-description ${canExpand && !descriptionExpanded ? 'collapsed' : 'expanded'}`}>{description}</p>
          {canExpand && <button type="button" className="view-more" onClick={() => setDescriptionExpanded(v => !v)}>{descriptionExpanded ? 'Show less ↑' : 'Show more ↓'}</button>}
        </div> : <p className="routine-description-empty">No description added for this routine.</p>}
        <div className="routine-meta">
          <span>↻ {specificDate ? 'Specific date' : frequency}</span>
          {routine.status ? <b>{routine.status}</b> : null}
        </div>
        {recurrence.start_date ? <div className="routine-start">▣ {specificDate ? displayDate(recurrence.start_date) : `Starts ${displayDate(recurrence.start_date)}`}</div> : null}
      </div>
    </section>

    {frequency === 'WEEKLY' && !specificDate && days.length > 0 && <section className="detail-card schedule-card"><div className="section-heading"><div><p className="section-kicker">SCHEDULE</p><h3>Your rhythm</h3></div><span>{days.length} {days.length === 1 ? 'day' : 'days'} / week</span></div><div className="days-row">{DAY_LABELS.map((label, index) => <div key={label} className={`day-chip ${days.includes(index) ? 'active' : ''}`}><small>{label.slice(0, 1)}</small><span>{label}</span></div>)}</div></section>}

    <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">MEAL PLAN</p><h3>Recipes</h3><span className="section-subtitle">{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} scheduled</span></div><span>{recipes.length}</span></div>{recipes.length ? <div className="routine-recipe-list">{recipes.map((item: AnyRecord, index: number) => <button type="button" key={`${item.recipe_id ?? item.id}-${index}`} className="routine-recipe-row" onClick={() => { if (item.recipe_id ?? item.id) navigate(`/recipes/${item.recipe_id ?? item.id}`) }}><span className="routine-recipe-icon">🍴</span><span><strong>{item.recipe_name || item.name || `Recipe #${item.recipe_id ?? item.id}`}</strong><small>{item.quantity != null ? `${item.quantity} ${item.quantity_unit || ''}` : 'Recipe scheduled'}</small></span><b>›</b></button>)}</div> : <div className="empty-detail">🍴<span>No recipes scheduled</span></div>}</section>
  </div>
}

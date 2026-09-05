import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api'

type AnyRecord = Record<string, any>

function first(value: any, fallback = '') { return value == null ? fallback : value }
function formatTime(minutes: any) { const n = Number(minutes); return Number.isFinite(n) && n > 0 ? `${n} min` : '—' }

export function RecipeDetailPage() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const [portion, setPortion] = useState(1)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({})
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})
  const [rating, setRating] = useState<number | null>(null)
  const [cookMode, setCookMode] = useState(false)
  const [cookStep, setCookStep] = useState(0)

  const query = useQuery({
    queryKey: ['recipe-detail', recipeId],
    queryFn: async () => (await api.recipes.get(recipeId!)).data,
    enabled: !!recipeId,
  })

  const recipe: AnyRecord | undefined = query.data?.data ?? query.data?.recipe ?? query.data
  const ingredients = useMemo(() => recipe?.ingredients ?? [], [recipe])
  const instructions = useMemo(() => recipe?.instructions ?? recipe?.steps ?? [], [recipe])
  const nutrition = recipe?.nutrition ?? recipe?.nutrition_summary ?? {}
  const servings = Number(recipe?.servings) || 1
  const scale = portion / servings
  const name = recipe?.name ?? recipe?.title ?? 'Recipe'

  const setRatingValue = (value: number) => {
    setRating(value)
    toast.success(`You rated this recipe ${value} star${value > 1 ? 's' : ''}.`)
  }

  if (query.isLoading) return <div className="detail-loading"><div className="detail-spinner" /><p>Loading recipe…</p></div>
  if (query.isError || !recipe) return <div className="detail-error"><div className="detail-error-icon">!</div><h2>Couldn’t load recipe</h2><p>Please try again.</p><button onClick={() => query.refetch()}>Retry</button></div>

  const activeInstruction = instructions[cookStep]
  const activeText = typeof activeInstruction === 'string' ? activeInstruction : activeInstruction?.instruction_text ?? activeInstruction?.text ?? ''

  return (
    <div className="detail-page">
      <div className="detail-topbar"><button className="back-button" onClick={() => navigate(-1)}>← <span>Back</span></button><div className="detail-top-actions">{recipe?.visibility ? <span className="visibility-pill">{recipe.visibility === 'PUBLIC' ? 'Public' : recipe.visibility}</span> : null}<button className="icon-button" onClick={() => toast('Edit recipe')}>✎</button></div></div>

      <section className="recipe-hero-detail">
        <div className="recipe-detail-image">{recipe.image_url || recipe.image_urls?.[0] ? <img src={recipe.image_url || recipe.image_urls?.[0]} alt={name} /> : <span>🥗</span>}</div>
        <div className="recipe-detail-copy">
          <p className="detail-eyebrow">RECIPE</p>
          <h2>{name}</h2>
          {recipe.description ? <p className="detail-description">{recipe.description}</p> : null}
          <div className="recipe-meta-grid">
            <div><strong>◷</strong><span>Prep<br /><b>{formatTime(recipe.preparation_time ?? recipe.prep_time)}</b></span></div>
            <div><strong>🔥</strong><span>Cook<br /><b>{formatTime(recipe.cooking_time ?? recipe.cook_time)}</b></span></div>
            <div><strong>◉</strong><span>Total<br /><b>{formatTime(recipe.total_time)}</b></span></div>
            <div><strong>♟</strong><span>Servings<br /><b>{servings}</b></span></div>
          </div>
          {recipe.category?.name || recipe.category ? <span className="detail-category">{typeof recipe.category === 'string' ? recipe.category : recipe.category.name}</span> : null}
        </div>
      </section>

      <section className="detail-card portion-card">
        <div><p className="section-kicker">PORTIONS</p><h3>Adjust portions</h3><span>Ingredients scale with your serving size.</span></div>
        <div className="portion-control"><button onClick={() => setPortion(Math.max(1, portion - 1))}>−</button><strong>{portion}</strong><button onClick={() => setPortion(portion + 1)}>+</button></div>
      </section>

      <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">INGREDIENTS</p><h3>Ingredients</h3></div><span>{ingredients.length}</span></div>
        <div className="ingredient-list">{ingredients.length ? ingredients.map((item: AnyRecord, index: number) => { const checked = !!checkedIngredients[index]; const quantity = Number(item.quantity); const scaled = Number.isFinite(quantity) ? Math.round(quantity * scale * 100) / 100 : item.quantity; return <button className={`ingredient-row ${checked ? 'checked' : ''}`} key={index} onClick={() => setCheckedIngredients(v => ({ ...v, [index]: !v[index] }))}><span className="check-circle">{checked ? '✓' : ''}</span><span className="ingredient-name">{item.name || item.ingredient_name || `Ingredient ${index + 1}`}</span><strong>{scaled ?? ''} {item.unit || ''}</strong></button> }) : <div className="empty-detail">No ingredients available.</div>}</div>
      </section>

      {(nutrition && (typeof nutrition === 'object' && Object.keys(nutrition).length > 0)) && <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">NUTRITION</p><h3>Nutrition</h3></div></div><div className="nutrition-grid">{Object.entries(nutrition).slice(0, 8).map(([key, value]) => <div className="nutrition-item" key={key}><strong>{String(value)}</strong><span>{key.replaceAll('_', ' ')}</span></div>)}</div></section>}

      <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">METHOD</p><h3>Instructions</h3></div><span>{instructions.length}</span></div>
        <div className="instruction-list">{instructions.length ? instructions.map((step: any, index: number) => { const text = typeof step === 'string' ? step : step.instruction_text ?? step.text ?? ''; const done = !!completedSteps[index]; return <div className={`instruction-row ${done ? 'completed' : ''}`} key={index}><button className="step-check" onClick={() => setCompletedSteps(v => ({ ...v, [index]: !v[index] }))}>{done ? '✓' : index + 1}</button><div><p>{text}</p>{step?.tip ? <small>Tip: {step.tip}</small> : null}{step?.timer_seconds ? <span className="timer-pill">◷ {Math.ceil(step.timer_seconds / 60)} min</span> : null}</div></div> }) : <div className="empty-detail">No instructions available.</div>}</div>
      </section>

      <section className="cook-card"><div><p className="section-kicker">READY?</p><h3>Cook with confidence.</h3><p>Follow the recipe step by step with ingredients and timers in one place.</p></div><button onClick={() => { setCookMode(true); setCookStep(0) }}>▶ Start Cooking</button></section>

      <section className="detail-section rating-section"><div><p className="section-kicker">YOUR RATING</p><h3>How was this recipe?</h3></div><div className="stars">{[1,2,3,4,5].map(value => <button key={value} className={rating && value <= rating ? 'selected' : ''} onClick={() => setRatingValue(value)}>★</button>)}</div></section>

      {cookMode && <div className="cook-overlay"><div className="cook-modal"><div className="cook-modal-head"><div><p className="section-kicker">COOK MODE</p><h2>Step {cookStep + 1} of {Math.max(instructions.length, 1)}</h2></div><button onClick={() => setCookMode(false)}>×</button></div><div className="cook-progress"><span style={{ width: `${instructions.length ? ((cookStep + 1) / instructions.length) * 100 : 100}%` }} /></div><p className="cook-instruction">{activeText || 'No cooking step available.'}</p>{activeInstruction?.tip ? <div className="cook-tip">Tip: {activeInstruction.tip}</div> : null}{activeInstruction?.timer_seconds ? <div className="cook-timer">◷ {Math.ceil(activeInstruction.timer_seconds / 60)} min</div> : null}<div className="cook-controls"><button disabled={cookStep === 0} onClick={() => setCookStep(s => Math.max(0, s - 1))}>← Previous</button><button onClick={() => cookStep >= instructions.length - 1 ? setCookMode(false) : setCookStep(s => s + 1)}>{cookStep >= instructions.length - 1 ? 'Finish' : 'Next →'}</button></div></div></div>}
    </div>
  )
}

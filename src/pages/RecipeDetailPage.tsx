import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api'

type AnyRecord = Record<string, any>
function formatTime(minutes: any) { const n = Number(minutes); return Number.isFinite(n) && n > 0 ? `${n} min` : '—' }
function labelize(value: string) { return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function nutritionValue(value: any): string { if (value == null) return '—'; if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value); if (Array.isArray(value)) return value.map(nutritionValue).join(', '); if (typeof value === 'object') return Object.entries(value).map(([k,v]) => `${labelize(k)}: ${nutritionValue(v)}`).join(' • '); return String(value) }
function nutritionNumber(value: any): number | null { const n = Number(value); return Number.isFinite(n) ? n : null }

function NutritionSection({ nutrition, servings }: { nutrition: AnyRecord; servings: number }) {
  const data = nutrition ?? {}
  const calories = nutritionNumber(data.calories ?? data.energy_kcal ?? data.energy?.value ?? data.total_calories)
  const protein = nutritionNumber(data.protein ?? data.protein_g ?? data.macros?.protein)
  const carbs = nutritionNumber(data.carbohydrates ?? data.carbs ?? data.carbs_g ?? data.macros?.carbohydrates ?? data.macros?.carbs)
  const fat = nutritionNumber(data.fat ?? data.fat_g ?? data.macros?.fat)
  const known = new Set(['calories','energy_kcal','energy','total_calories','protein','protein_g','carbohydrates','carbs','carbs_g','fat','fat_g','macros'])
  const extras = Object.entries(data).filter(([key]) => !known.has(key))
  if (calories === null && protein === null && carbs === null && fat === null && extras.length === 0) return null
  return <section className="detail-section nutrition-mobile-section"><div className="nutrition-mobile-header"><div><div className="nutrition-title"><span className="nutrition-flame">♨</span><h3>Nutrition</h3></div><span className="nutrition-serving-label">Per serving</span></div><span className="nutrition-serving-count">{servings} serving{servings !== 1 ? 's' : ''}</span></div><div className="nutrition-energy-card"><div><span className="nutrition-energy-label">Total energy</span><strong>{calories !== null ? Math.round(calories) : '—'}</strong><span>kcal</span></div><div className="nutrition-energy-icon">⌁</div></div><div className="nutrition-macros"><div className="nutrition-macro protein"><span className="macro-icon">●</span><span>Protein</span><strong>{protein !== null ? `${protein} g` : '—'}</strong></div><div className="nutrition-macro carbs"><span className="macro-icon">◆</span><span>Carbs</span><strong>{carbs !== null ? `${carbs} g` : '—'}</strong></div><div className="nutrition-macro fat"><span className="macro-icon">●</span><span>Fat</span><strong>{fat !== null ? `${fat} g` : '—'}</strong></div></div>{extras.length > 0 && <details className="nutrition-more"><summary>View full nutrition <span>›</span></summary><div className="nutrition-extra-list">{extras.map(([key,value]) => <div key={key}><span>{labelize(key)}</span><strong>{nutritionValue(value)}</strong></div>)}</div></details>}</section>
}

export function RecipeDetailPage() {
  const { recipeId } = useParams()
  const [portionMode, setPortionMode] = useState<'serving' | 'quantity'>('serving')
  const [servings, setServings] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({})
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})
  const [rating, setRating] = useState<number | null>(null)
  const [cookMode, setCookMode] = useState(false)
  const [cookStep, setCookStep] = useState(0)
  const query = useQuery({ queryKey: ['recipe-detail', recipeId], queryFn: async () => (await api.recipes.get(recipeId!)).data, enabled: !!recipeId })
  const recipe: AnyRecord | undefined = query.data?.data ?? query.data?.recipe ?? query.data
  const ingredients = useMemo(() => recipe?.ingredients ?? [], [recipe])
  const instructions = useMemo(() => recipe?.instructions ?? recipe?.steps ?? [], [recipe])
  const nutrition = recipe?.nutrition ?? recipe?.nutrition_summary ?? {}
  const baseServings = Number(recipe?.servings) || 1
  const scale = portionMode === 'serving' ? servings / baseServings : quantity
  const name = recipe?.name ?? recipe?.title ?? 'Recipe'
  const setRatingValue = (value: number) => { setRating(value); toast.success(`You rated this recipe ${value} star${value > 1 ? 's' : ''}.`) }
  if (query.isLoading) return <div className="detail-loading"><div className="detail-spinner" /><p>Loading recipe…</p></div>
  if (query.isError || !recipe) return <div className="detail-error"><div className="detail-error-icon">!</div><h2>Couldn’t load recipe</h2><p>Please try again.</p><button onClick={() => query.refetch()}>Retry</button></div>
  const activeInstruction = instructions[cookStep]
  const activeText = typeof activeInstruction === 'string' ? activeInstruction : activeInstruction?.instruction_text ?? activeInstruction?.text ?? ''
  return <div className="detail-page">
    <section className="recipe-hero-detail"><div className="recipe-detail-image">{recipe.image_url || recipe.image_urls?.[0] ? <img src={recipe.image_url || recipe.image_urls?.[0]} alt={name} /> : <span>🥗</span>}</div><div className="recipe-detail-copy"><p className="detail-eyebrow">RECIPE</p><h2>{name}</h2>{recipe.description ? <p className="detail-description">{recipe.description}</p> : null}<div className="recipe-meta-grid"><div><strong>◷</strong><span>Prep<br /><b>{formatTime(recipe.preparation_time ?? recipe.prep_time)}</b></span></div><div><strong>🔥</strong><span>Cook<br /><b>{formatTime(recipe.cooking_time ?? recipe.cook_time)}</b></span></div><div><strong>◉</strong><span>Total<br /><b>{formatTime(recipe.total_time)}</b></span></div><div><strong>♟</strong><span>Servings<br /><b>{baseServings}</b></span></div></div>{recipe.category?.name || recipe.category ? <span className="detail-category">{typeof recipe.category === 'string' ? recipe.category : recipe.category.name}</span> : null}</div></section>
    <section className="detail-card portion-card"><div><p className="section-kicker">PORTIONS</p><h3>Adjust portions</h3><span>Choose how you want to scale the recipe.</span></div><div className="portion-tabs"><button className={portionMode === 'serving' ? 'active' : ''} onClick={() => setPortionMode('serving')}>Serving</button><button className={portionMode === 'quantity' ? 'active' : ''} onClick={() => setPortionMode('quantity')}>Quantity</button></div><div className="portion-control"><button onClick={() => portionMode === 'serving' ? setServings(Math.max(1, servings - 1)) : setQuantity(Math.max(0.25, quantity - 0.25))}>−</button><strong>{portionMode === 'serving' ? servings : quantity}</strong><button onClick={() => portionMode === 'serving' ? setServings(servings + 1) : setQuantity(quantity + 0.25)}>+</button></div><span className="portion-mode-caption">{portionMode === 'serving' ? 'serving' : 'recipe quantity'}</span></section>
    <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">INGREDIENTS</p><h3>Ingredients</h3></div><span>{ingredients.length}</span></div><div className="ingredient-list">{ingredients.length ? ingredients.map((item: AnyRecord,index:number) => { const checked=!!checkedIngredients[index]; const n=Number(item.quantity); const scaled=Number.isFinite(n) ? Math.round(n*scale*100)/100 : item.quantity; return <button className={`ingredient-row ${checked?'checked':''}`} key={index} onClick={() => setCheckedIngredients(v=>({...v,[index]:!v[index]}))}><span className="check-circle">{checked?'✓':''}</span><span className="ingredient-name">{item.name || item.ingredient_name || `Ingredient ${index+1}`}</span><strong>{scaled ?? ''} {item.unit || ''}</strong></button> }) : <div className="empty-detail">No ingredients available.</div>}</div></section>
    <NutritionSection nutrition={nutrition} servings={portionMode === 'serving' ? servings : Math.round(baseServings * quantity * 100) / 100} />
    <section className="detail-section"><div className="section-heading"><div><p className="section-kicker">METHOD</p><h3>Instructions</h3></div><span>{instructions.length}</span></div><div className="instruction-list">{instructions.length ? instructions.map((step:any,index:number)=>{const text=typeof step==='string'?step:step.instruction_text??step.text??'';const done=!!completedSteps[index];return <div className={`instruction-row ${done?'completed':''}`} key={index}><button className="step-check" onClick={()=>setCompletedSteps(v=>({...v,[index]:!v[index]}))}>{done?'✓':index+1}</button><div><p>{text}</p>{step?.tip?<small>Tip: {nutritionValue(step.tip)}</small>:null}{step?.timer_seconds?<span className="timer-pill">◷ {Math.ceil(step.timer_seconds/60)} min</span>:null}</div></div>}) : <div className="empty-detail">No instructions available.</div>}</div></section>
    <section className="cook-card"><div><p className="section-kicker">READY?</p><h3>Cook with confidence.</h3><p>Follow the recipe step by step with ingredients and timers in one place.</p></div><button onClick={()=>{setCookMode(true);setCookStep(0)}}>▶ Start Cooking</button></section>
    <section className="detail-section rating-section"><div><p className="section-kicker">YOUR RATING</p><h3>How was this recipe?</h3></div><div className="stars">{[1,2,3,4,5].map(value=><button key={value} className={rating&&value<=rating?'selected':''} onClick={()=>setRatingValue(value)}>★</button>)}</div></section>
    {cookMode&&<div className="cook-overlay"><div className="cook-modal"><div className="cook-modal-head"><div><p className="section-kicker">COOK MODE</p><h2>Step {cookStep+1} of {Math.max(instructions.length,1)}</h2></div><button onClick={()=>setCookMode(false)}>×</button></div><div className="cook-progress"><span style={{width:`${instructions.length?((cookStep+1)/instructions.length)*100:100}%`}}/></div><p className="cook-instruction">{activeText||'No cooking step available.'}</p>{activeInstruction?.tip?<div className="cook-tip">Tip: {nutritionValue(activeInstruction.tip)}</div>:null}{activeInstruction?.timer_seconds?<div className="cook-timer">◷ {Math.ceil(activeInstruction.timer_seconds/60)} min</div>:null}<div className="cook-controls"><button disabled={cookStep===0} onClick={()=>setCookStep(s=>Math.max(0,s-1))}>← Previous</button><button onClick={()=>cookStep>=instructions.length-1?setCookMode(false):setCookStep(s=>s+1)}>{cookStep>=instructions.length-1?'Finish':'Next →'}</button></div></div></div>}
  </div>
}

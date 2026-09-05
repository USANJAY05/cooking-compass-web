import { useMemo, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { keycloak } from '../keycloak'

type SettingsRowProps = {
  icon: string
  title: string
  subtitle: string
  onClick?: () => void
}

function SettingsRow({ icon, title, subtitle, onClick }: SettingsRowProps) {
  return (
    <button type="button" onClick={onClick} className="group flex min-h-[76px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/30">
      <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[13px] bg-sage/10 text-[20px] text-moss">{icon}</span>
      <span className="min-w-0 flex-1 pr-2">
        <span className="block truncate text-[15px] font-extrabold text-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-[17px] text-slate-500">{subtitle}</span>
      </span>
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-sm font-bold text-slate-400 transition group-hover:bg-sage/10 group-hover:text-moss">›</span>
    </button>
  )
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <p className="mb-2 ml-1 text-[10.5px] font-black tracking-[.125em] text-slate-400">{title}</p>
      <div className="overflow-hidden rounded-[19px] bg-white shadow-sm ring-1 ring-black/5">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [compact, setCompact] = useState(false)

  const profile = useMemo(() => {
    const token = keycloak.tokenParsed as Record<string, unknown> | undefined
    const name = String(token?.name || token?.preferred_username || 'Cooking enthusiast')
    const usernameValue = token?.preferred_username ? String(token.preferred_username) : ''
    const email = token?.email ? String(token.email) : ''
    const picture = token?.picture ? String(token.picture) : ''
    const initials = name.trim().charAt(0).toUpperCase() || 'U'
    return { name, username: usernameValue ? `@${usernameValue}` : '', email, picture, initials }
  }, [])

  const comingSoon = (title: string) => toast(title + ' is coming soon')
  const save = () => toast.success('Settings saved')

  return (
    <div className="mx-auto w-full max-w-3xl px-1 pb-8 sm:px-2 lg:max-w-4xl">
      <div className="mb-5 sm:mb-7">
        <p className="text-[10.5px] font-black tracking-[.125em] text-sage">SETTINGS</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Settings</h1>
        <p className="mt-1.5 text-sm text-slate-500">Make MUVETH Kitchen feel like yours.</p>
      </div>

      <section className="mb-6 rounded-[24px] bg-white px-[18px] py-6 text-center shadow-sm ring-1 ring-black/5 sm:mb-7">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-moss/20 bg-moss/10 p-1.5">
          {profile.picture ? <img src={profile.picture} alt="Profile" className="h-full w-full rounded-full object-cover" /> : <div className="flex h-full w-full items-center justify-center rounded-full bg-moss text-3xl font-black text-white">{profile.initials}</div>}
        </div>
        <h2 className="truncate px-4 text-xl font-black tracking-tight text-ink">{profile.name}</h2>
        {profile.username && <p className="mt-1 truncate px-4 text-[13px] text-slate-500">{profile.username}</p>}
        {profile.email && <p className="mt-1 truncate px-4 text-xs text-slate-400">{profile.email}</p>}
      </section>

      <SettingsGroup title="PREFERENCES">
        <SettingsRow icon="◐" title="Appearance" subtitle="Theme, colors and display" onClick={() => comingSoon('Appearance settings')} />
        <div className="ml-[69px] h-px bg-black/5" />
        <SettingsRow icon="◈" title="Recipe creation" subtitle="Normal or recording mode for new recipes" onClick={() => comingSoon('Recipe creation settings')} />
        <div className="ml-[69px] h-px bg-black/5" />
        <SettingsRow icon="◉" title="Interactive cooking" subtitle="Liberal or strict step guidance" onClick={() => comingSoon('Interactive cooking settings')} />
      </SettingsGroup>

      <SettingsGroup title="ACCOUNT">
        <SettingsRow icon="●" title="Account information" subtitle="Name, username and email" onClick={() => comingSoon('Account information')} />
        <div className="ml-[69px] h-px bg-black/5" />
        <SettingsRow icon="◇" title="Security" subtitle="Sessions and sign-in controls" onClick={() => comingSoon('Security settings')} />
        <div className="ml-[69px] h-px bg-black/5" />
        <SettingsRow icon="ⓘ" title="About" subtitle="MUVETH Kitchen · v0.2.0" onClick={() => comingSoon('About')} />
      </SettingsGroup>

      <SettingsGroup title="QUICK PREFERENCES">
        <label className="flex min-h-[76px] cursor-pointer items-center justify-between gap-4 px-3.5 py-2.5">
          <div className="min-w-0"><p className="text-[15px] font-extrabold text-ink">Cooking notifications</p><p className="mt-0.5 text-[12px] leading-[17px] text-slate-500">Receive useful kitchen reminders.</p></div>
          <input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="h-5 w-5 shrink-0 accent-[#3d513f]" />
        </label>
        <div className="ml-[69px] h-px bg-black/5" />
        <label className="flex min-h-[76px] cursor-pointer items-center justify-between gap-4 px-3.5 py-2.5">
          <div className="min-w-0"><p className="text-[15px] font-extrabold text-ink">Compact recipe cards</p><p className="mt-0.5 text-[12px] leading-[17px] text-slate-500">Show more recipes at once.</p></div>
          <input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="h-5 w-5 shrink-0 accent-[#3d513f]" />
        </label>
      </SettingsGroup>

      <div className="mb-6 flex justify-end">
        <button type="button" onClick={save} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">Save settings</button>
      </div>

      <button type="button" onClick={() => keycloak.logout({ redirectUri: window.location.origin })} className="mb-7 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200">Sign out of MUVETH Kitchen</button>

      <p className="text-center text-[9.5px] font-black tracking-[.17em] text-slate-400">MUVETH · HEALTH</p>
    </div>
  )
}

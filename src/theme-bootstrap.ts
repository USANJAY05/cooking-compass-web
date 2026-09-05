const media = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme() {
  const value = localStorage.getItem('muveth-theme') || 'system'
  const dark = value === 'dark' || value === 'black' || (value === 'system' && media.matches)
  document.documentElement.dataset.theme = dark ? (value === 'black' ? 'black' : 'dark') : 'light'
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

applyTheme()
media.addEventListener?.('change', applyTheme)
window.addEventListener('storage', applyTheme)
setInterval(applyTheme, 250)

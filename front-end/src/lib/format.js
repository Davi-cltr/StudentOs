// Datas chegam da API como "AAAA-MM-DD". Montamos o Date manualmente para
// evitar o deslocamento de fuso horário de new Date("AAAA-MM-DD").
export function parseDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(iso) {
  const date = parseDate(iso)
  if (!date) return ''
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === '') return null
  return Number(grade).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

// Cálculos do painel inicial: atrasos, agenda e médias.
// São funções puras (recebem os dados e a data de hoje), por isso são fáceis de testar.
import { parseDate } from './format.js'

const DAY_MS = 86_400_000

// Quantos dias faltam de `todayIso` até `iso` (negativo = já passou).
export function daysUntil(iso, todayIso) {
  return Math.round((parseDate(iso) - parseDate(todayIso)) / DAY_MS)
}

export function relativeDay(days) {
  if (days === 0) return 'hoje'
  if (days === 1) return 'amanhã'
  if (days === -1) return 'ontem'
  if (days > 0) return `em ${days} dias`
  return `há ${-days} dias`
}

export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`
}

const isOpen = (task) => task.status !== 'completed'

const byDate = (a, b) => a.date.localeCompare(b.date)

// Tarefas não concluídas cuja entrega já passou, da mais antiga para a mais recente.
export function overdueTasks(tasks, today) {
  return tasks
    .filter((task) => isOpen(task) && task.due_date && task.due_date < today)
    .map((task) => ({ ...task, date: task.due_date }))
    .sort(byDate)
}

// Tarefas não concluídas com entrega de hoje até hoje + `days` - 1.
export function tasksDueWithin(tasks, today, days) {
  return tasks.filter((task) => {
    if (!isOpen(task) || !task.due_date) return false
    const left = daysUntil(task.due_date, today)
    return left >= 0 && left < days
  })
}

// A prova mais próxima (hoje ou depois), ou null.
export function nextExam(exams, today) {
  const upcoming = exams.filter((exam) => exam.date >= today)
  upcoming.sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] ?? null
}

// Agenda dos próximos `horizon` dias: tarefas em aberto e provas, agrupadas por dia.
// No mesmo dia, as provas vêm antes das tarefas.
export function buildAgenda(tasks, exams, today, horizon = 14) {
  const items = [
    ...tasks
      .filter((task) => isOpen(task) && task.due_date)
      .map((task) => ({
        kind: 'task',
        key: `task-${task.id}`,
        title: task.title,
        date: task.due_date,
        subject_id: task.subject_id,
      })),
    ...exams.map((exam) => ({
      kind: 'exam',
      key: `exam-${exam.id}`,
      title: exam.name,
      date: exam.date,
      subject_id: exam.subject_id,
    })),
  ].filter((item) => {
    const left = daysUntil(item.date, today)
    return left >= 0 && left < horizon
  })

  items.sort((a, b) => byDate(a, b) || (a.kind === b.kind ? 0 : a.kind === 'exam' ? -1 : 1))

  const days = []
  for (const item of items) {
    const last = days[days.length - 1]
    if (last && last.date === item.date) last.items.push(item)
    else days.push({ date: item.date, items: [item] })
  }
  return days
}

const hasGrade = (exam) => exam.grade !== null && exam.grade !== undefined && exam.grade !== ''

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length

// Média das provas com nota, por matéria (da maior para a menor).
// Matérias sem nenhuma nota ficam de fora.
export function subjectAverages(exams, subjects) {
  return subjects
    .map((subject) => {
      const grades = exams
        .filter((exam) => exam.subject_id === subject.id && hasGrade(exam))
        .map((exam) => Number(exam.grade))
      return { subject, count: grades.length, average: grades.length ? mean(grades) : null }
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.average - a.average)
}

// Média de todas as provas com nota, ou null se não houver nenhuma.
export function overallAverage(exams) {
  const grades = exams.filter(hasGrade).map((exam) => Number(exam.grade))
  return grades.length ? { average: mean(grades), count: grades.length } : null
}

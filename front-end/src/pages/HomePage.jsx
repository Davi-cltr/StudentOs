import { useAuth } from '../auth/context'
import { EmptyState, LoadError, Loading, PageHeader } from '../components/ui'
import {
  buildAgenda,
  daysUntil,
  nextExam,
  overallAverage,
  overdueTasks,
  plural,
  relativeDay,
  subjectAverages,
  tasksDueWithin,
} from '../lib/agenda'
import { formatDate, formatGrade, parseDate, todayISO } from '../lib/format'
import { useResource } from '../useResource'

const AGENDA_DAYS = 14

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function dayHeading(iso, today) {
  const left = daysUntil(iso, today)
  const full = parseDate(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  if (left === 0) return `Hoje, ${full.split(', ')[1]}`
  if (left === 1) return `Amanhã, ${full.split(', ')[1]}`
  return capitalize(full)
}

export default function HomePage({ subjects, goTo }) {
  const { user } = useAuth()
  const tasks = useResource('tasks', 'task')
  const exams = useResource('exams', 'exam')

  const today = todayISO()
  const loading = tasks.loading || exams.loading || subjects.loading
  const error = tasks.error || exams.error || subjects.error
  const retry = () => {
    tasks.reload()
    exams.reload()
    subjects.reload()
  }

  const subjectName = (id) => subjects.items.find((subject) => subject.id === id)?.name ?? ''

  const late = overdueTasks(tasks.items, today)
  const week = tasksDueWithin(tasks.items, today, 7)
  const upcomingExam = nextExam(exams.items, today)
  const agenda = buildAgenda(tasks.items, exams.items, today, AGENDA_DAYS)
  const averages = subjectAverages(exams.items, subjects.items)
  const overall = overallAverage(exams.items)

  const todayLabel = capitalize(
    parseDate(today).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
  )

  return (
    <section>
      <PageHeader title="Início" />
      <p className="today">
        Olá, {user.name.split(' ')[0]}. {todayLabel}
      </p>

      {loading && <Loading />}
      {error && <LoadError error={error} onRetry={retry} />}

      {!loading && !error && subjects.items.length === 0 && (
        <EmptyState title="Comece pelas suas matérias.">
          <p>
            Depois de cadastrar uma matéria, você registra tarefas, provas e anotações e acompanha
            tudo por aqui.
          </p>
          <button type="button" className="btn primary" onClick={() => goTo('materias')}>
            Cadastrar matéria
          </button>
        </EmptyState>
      )}

      {!loading && !error && subjects.items.length > 0 && (
        <>
          <ul className="brief">
            {late.length > 0 && (
              <li>
                <a href="#tarefas" className="brief-late">
                  {plural(late.length, 'tarefa atrasada', 'tarefas atrasadas')}
                </a>
              </li>
            )}
            <li>
              <a href="#tarefas">
                {week.length > 0
                  ? `${plural(week.length, 'tarefa', 'tarefas')} para os próximos 7 dias`
                  : 'Nenhuma tarefa para os próximos 7 dias'}
              </a>
            </li>
            <li>
              <a href="#provas">
                {upcomingExam
                  ? `Próxima prova: ${upcomingExam.name}, ${relativeDay(daysUntil(upcomingExam.date, today))}`
                  : 'Nenhuma prova marcada'}
              </a>
            </li>
          </ul>

          <h2 className="group-title">Próximos {AGENDA_DAYS} dias</h2>

          {late.length > 0 && (
            <>
              <h3 className="day-title is-late">Atrasadas</h3>
              <ul className="agenda">
                {late.map((task) => (
                  <li key={task.id} className="agenda-item">
                    <span className="kind outline">Entrega</span>
                    <span className="agenda-title">{task.title}</span>
                    <span className="tag">{subjectName(task.subject_id)}</span>
                    <span className="due late">Venceu em {formatDate(task.date)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {agenda.length === 0 && late.length === 0 && (
            <p className="agenda-empty">Nada marcado para os próximos {AGENDA_DAYS} dias.</p>
          )}

          {agenda.map((day) => (
            <div key={day.date}>
              <h3 className={day.date === today ? 'day-title is-today' : 'day-title'}>
                <span>{dayHeading(day.date, today)}</span>
              </h3>
              <ul className="agenda">
                {day.items.map((item) => (
                  <li key={item.key} className="agenda-item">
                    <span className={item.kind === 'exam' ? 'kind' : 'kind outline'}>
                      {item.kind === 'exam' ? 'Prova' : 'Entrega'}
                    </span>
                    <span className="agenda-title">{item.title}</span>
                    <span className="tag">{subjectName(item.subject_id)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h2 className="group-title">Notas por matéria</h2>
          {averages.length === 0 ? (
            <p className="agenda-empty">
              Quando você registrar notas nas provas, a média de cada matéria aparece aqui.
            </p>
          ) : (
            <>
              <ul className="grades">
                {averages.map(({ subject, average, count }) => (
                  <li key={subject.id}>
                    <span className="grade-name">{subject.name}</span>
                    <span className="grade-track" aria-hidden="true">
                      <span className="grade-fill" style={{ width: `${average * 10}%` }} />
                    </span>
                    <span className="grade-value">{formatGrade(average)}</span>
                    <span className="grade-count">{plural(count, 'prova', 'provas')}</span>
                  </li>
                ))}
              </ul>
              <p className="grades-total">
                Média geral: <b>{formatGrade(overall.average)}</b>, em{' '}
                {plural(overall.count, 'prova com nota', 'provas com nota')}.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}

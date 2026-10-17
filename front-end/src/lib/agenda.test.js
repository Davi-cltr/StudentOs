import assert from 'node:assert/strict'
import { test } from 'node:test'
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
} from './agenda.js'

const TODAY = '2026-10-16'

test('daysUntil conta dias entre datas, inclusive na virada de mês e de ano', () => {
  assert.equal(daysUntil('2026-10-16', TODAY), 0)
  assert.equal(daysUntil('2026-10-17', TODAY), 1)
  assert.equal(daysUntil('2026-11-20', TODAY), 35)
  assert.equal(daysUntil('2026-10-10', TODAY), -6)
  assert.equal(daysUntil('2027-01-02', '2026-12-30'), 3)
})

test('relativeDay e plural escrevem em português', () => {
  assert.equal(relativeDay(0), 'hoje')
  assert.equal(relativeDay(1), 'amanhã')
  assert.equal(relativeDay(35), 'em 35 dias')
  assert.equal(relativeDay(-1), 'ontem')
  assert.equal(relativeDay(-6), 'há 6 dias')
  assert.equal(plural(1, 'tarefa', 'tarefas'), '1 tarefa')
  assert.equal(plural(0, 'tarefa', 'tarefas'), '0 tarefas')
  assert.equal(plural(3, 'tarefa', 'tarefas'), '3 tarefas')
})

const tasks = [
  { id: 1, title: 'Atrasada', status: 'pending', due_date: '2026-10-10', subject_id: 1 },
  { id: 2, title: 'Atrasada e concluída', status: 'completed', due_date: '2026-10-01', subject_id: 1 },
  { id: 3, title: 'Hoje', status: 'in_progress', due_date: '2026-10-16', subject_id: 1 },
  { id: 4, title: 'Amanhã', status: 'pending', due_date: '2026-10-17', subject_id: 2 },
  { id: 5, title: 'Em 20 dias', status: 'pending', due_date: '2026-11-05', subject_id: 2 },
  { id: 6, title: 'Sem data', status: 'pending', due_date: null, subject_id: 2 },
]

const exams = [
  { id: 1, name: 'Já passou', date: '2026-10-01', grade: '8.5', subject_id: 2 },
  { id: 2, name: 'Amanhã', date: '2026-10-17', grade: null, subject_id: 1 },
  { id: 3, name: 'Em 35 dias', date: '2026-11-20', grade: null, subject_id: 1 },
]

test('overdueTasks ignora concluídas e tarefas sem data', () => {
  assert.deepEqual(
    overdueTasks(tasks, TODAY).map((task) => task.id),
    [1],
  )
})

test('tasksDueWithin considera hoje e os próximos dias, sem atrasadas nem concluídas', () => {
  assert.deepEqual(
    tasksDueWithin(tasks, TODAY, 7).map((task) => task.id),
    [3, 4],
  )
  assert.deepEqual(tasksDueWithin(tasks, TODAY, 1).map((task) => task.id), [3])
})

test('nextExam devolve a prova futura mais próxima', () => {
  assert.equal(nextExam(exams, TODAY).id, 2)
  assert.equal(nextExam(exams, '2026-12-01'), null)
  assert.equal(nextExam([], TODAY), null)
})

test('buildAgenda agrupa por dia, respeita o horizonte e põe provas antes das tarefas', () => {
  const sameDay = [{ id: 9, name: 'Prova de hoje', date: '2026-10-17', grade: null, subject_id: 1 }]
  const agenda = buildAgenda(tasks, [...exams, ...sameDay], TODAY, 14)

  assert.deepEqual(
    agenda.map((day) => day.date),
    ['2026-10-16', '2026-10-17'],
  )
  assert.deepEqual(
    agenda[1].items.map((item) => item.key),
    ['exam-2', 'exam-9', 'task-4'],
  )
})

test('buildAgenda não inclui o que está fora da janela', () => {
  assert.deepEqual(buildAgenda(tasks, exams, TODAY, 1).map((day) => day.date), ['2026-10-16'])
  assert.deepEqual(buildAgenda([], [], TODAY), [])
})

test('subjectAverages calcula a média por matéria e ignora provas sem nota', () => {
  const subjects = [
    { id: 1, name: 'Matemática' },
    { id: 2, name: 'História' },
    { id: 3, name: 'Física' },
  ]
  const graded = [
    { id: 1, subject_id: 2, grade: '8.5' },
    { id: 2, subject_id: 2, grade: '7.5' },
    { id: 3, subject_id: 1, grade: '9' },
    { id: 4, subject_id: 1, grade: null },
  ]
  const result = subjectAverages(graded, subjects)

  assert.deepEqual(
    result.map((row) => [row.subject.name, row.average, row.count]),
    [
      ['Matemática', 9, 1],
      ['História', 8, 2],
    ],
  )
})

test('overallAverage junta todas as notas e devolve null sem notas', () => {
  const result = overallAverage([
    { grade: '8' },
    { grade: '6' },
    { grade: null },
    { grade: 10 },
  ])
  assert.deepEqual(result, { average: 8, count: 3 })
  assert.equal(overallAverage([{ grade: null }]), null)
  assert.equal(overallAverage([]), null)
})

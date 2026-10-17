# StudentOS — front-end

Interface web do StudentOS, feita com React e Vite. Ela consome a API Rails da pasta `back-end/`.

## Telas

- **Entrar / Criar conta:** cada pessoa tem a sua conta e só vê os próprios dados. A sessão fica guardada no navegador; o botão **Sair** (no topo) encerra a sessão. Se o login expirar, o app volta para a tela de entrada com um aviso.
- **Início:** resumo do dia (tarefas atrasadas, entregas da semana, próxima prova), agenda dos próximos 14 dias com tarefas e provas, e a média das notas por matéria.
- **Tarefas:** lista dividida em "A fazer" e "Concluídas". O checkbox conclui ou reabre a tarefa; tarefas atrasadas ficam destacadas.
- **Provas:** separadas em "Próximas" e "Já realizadas", com a nota quando existe.
- **Anotações:** lista por matéria; clique no título para ler o texto.
- **Matérias:** cadastro de matérias e professores. Excluir uma matéria exclui também suas tarefas, provas e anotações.

Tarefas, provas e anotações podem ser filtradas por matéria.

## Como rodar

Você precisa do Node.js e do backend rodando.

```bash
# 1. Backend (em um terminal)
cd back-end
bundle install
bin/rails db:setup
bin/rails server        # http://localhost:3000

# 2. Frontend (em outro terminal)
cd front-end
npm install
npm run dev             # http://localhost:5173
```

Abra o frontend e use **Criar conta** na primeira vez. Se você já tinha matérias cadastradas
antes do login existir, associe-as à sua conta (troque pelo e-mail que você cadastrou):

```bash
cd back-end
bin/rails "studentos:claim_orphans[seu@email.com]"
```

Em desenvolvimento, o Vite encaminha as chamadas de `/api` para `http://localhost:3000`,
então não é preciso configurar CORS. Para apontar para outro endereço:

```bash
API_TARGET=http://localhost:4000 npm run dev
```

## Scripts

| Comando           | O que faz                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento              |
| `npm run build`   | Gera a versão de produção em `dist/`     |
| `npm run preview` | Serve a versão de produção localmente    |
| `npm run lint`    | Verifica o código com o Oxlint           |
| `npm test`        | Testes das regras de agenda e médias     |

## Estrutura

```
src/
  api.js           cliente da API (fetch, token de login e tratamento de erros)
  auth/            contexto de login (AuthProvider, useAuth)
  Workspace.jsx    o app depois do login (navegação e páginas)
  useResource.js   hook que carrega e altera uma lista da API
  pages/           uma página por seção
  components/      diálogos (Modal) e peças compartilhadas (ui)
  lib/format.js    datas e notas em português
  lib/agenda.js    regras do painel inicial (com testes em agenda.test.js)
  index.css        estilos e cores (tema claro e escuro)
```

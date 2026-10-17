# StudentOS — back-end

API Rails (somente API) do StudentOS: matérias, tarefas, provas e anotações, com contas de usuário.

## Como rodar

```bash
bundle install        # o bcrypt compila código nativo, precisa de um compilador C
bin/rails db:setup
bin/rails server      # http://localhost:3000
bin/rails test        # testes
```

Ruby 3.3 (veja `.ruby-version`) e SQLite.

## Autenticação

Cada usuário só enxerga e altera os próprios dados. Dados de outro usuário respondem `404`.

| Método e rota      | O que faz                                                    |
| ------------------ | ------------------------------------------------------------ |
| `POST /api/v1/signup` | Cria a conta. Corpo: `{ "user": { "name", "email", "password", "password_confirmation" } }` |
| `POST /api/v1/login`  | Entra. Corpo: `{ "email", "password" }`                    |
| `GET /api/v1/me`      | Dados de quem está logado                                  |
| `DELETE /api/v1/logout` | Encerra a sessão atual                                   |

`signup` e `login` respondem `{ "token": "...", "user": { "id", "name", "email" } }`. Nas demais
rotas, envie o cabeçalho `Authorization: Bearer <token>`; sem ele (ou com token inválido ou
expirado) a resposta é `401`.

Detalhes de segurança:

- Senhas com `bcrypt` (`has_secure_password`), mínimo de 8 caracteres.
- O token é aleatório e opaco; o banco guarda só o seu hash SHA-256. Vale por 30 dias.
- Sair invalida apenas o token usado; outros aparelhos continuam logados.
- Tarefas, provas e anotações só podem ser criadas ou movidas para matérias do próprio usuário.
- Ainda não há limite de tentativas de login (o Rails 7.2 não traz `rate_limit`).

## Dados criados antes do login

Matérias cadastradas antes existirem sem dono. Para associá-las a uma conta:

```bash
bin/rails "studentos:claim_orphans[seu@email.com]"
```

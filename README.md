# TodoList – Plataforma de Tarefas

Aplicação web fullstack para gerenciamento de tarefas com autenticação de usuários.

---

## Sumário

1. [Descrição Geral](#descrição-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura de Pastas e Arquivos](#estrutura-de-pastas-e-arquivos)
4. [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
5. [Funções Principais](#funções-principais)
6. [Segurança Aplicada](#segurança-aplicada)
7. [Fluxo de Uso do Sistema](#fluxo-de-uso-do-sistema)
8. [Instalação e Execução Local](#instalação-e-execução-local)

---

## Descrição Geral

### Objetivo do Projeto

Plataforma web que permite usuários se cadastrarem, autenticarem e gerenciarem sua própria lista de tarefas. Cada usuário possui acesso exclusivo às suas tarefas, podendo criar, visualizar, editar e deletar registros. As tarefas possuem título, descrição opcional, status (pendente, em andamento ou concluída) e uma lista de itens com checkbox persistido no banco — permitindo acompanhar subtarefas individualmente. Filtros por status facilitam a organização do dia.

---

## Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| Express | 5.2.1 | Framework HTTP |
| PostgreSQL | — | Banco de dados relacional |
| Drizzle ORM | 0.45.1 | ORM para queries type-safe |
| bcrypt | 6.0.0 | Hash seguro de senhas |
| jsonwebtoken | 9.0.3 | Autenticação via JWT |
| dotenv | 17.3.1 | Variáveis de ambiente |
| cors | 2.8.6 | Política de CORS |
| nodemon | 3.1.11 | Hot-reload em desenvolvimento |

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19 | Biblioteca de UI |
| React Router | 7.13.0 | Roteamento client-side |
| Vite | 7.3.1 | Build tool e dev server |
| Tailwind CSS | 4.2.0 | Estilização utilitária |
| shadcn/ui + Radix UI | — | Componentes de UI acessíveis |
| react-hook-form | 7.71.1 | Gerenciamento de formulários |
| Zod | 4.3.6 | Validação de schemas |
| Sonner | 2.0.7 | Notificações toast |
| lucide-react | 0.574.0 | Ícones SVG |

---

## Estrutura de Pastas e Arquivos

```
Todo-List/
├── Backend/
│   ├── src/
│   │   ├── server.js              # Ponto de entrada: inicia o servidor HTTP na porta configurada
│   │   ├── app.js                 # Configura o Express: CORS, JSON parser e registro de rotas
│   │   ├── db/
│   │   │   ├── index.js           # Conexão com o banco PostgreSQL via Drizzle ORM
│   │   │   └── schema/
│   │   │       ├── users.schema.js       # Define a tabela "users" (id, name, email, password_hash)
│   │   │       ├── tasks.schema.js       # Define a tabela "tasks" e o enum "task_status"
│   │   │       └── task_items.schema.js  # Define a tabela "task_items" (itens de checklist por tarefa)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Lógica de registro e login de usuários
│   │   │   └── tasks.controller.js  # Lógica de CRUD das tarefas e toggle de itens
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Declara as rotas POST /auth/register e POST /auth/login
│   │   │   └── tasks.routes.js      # Declara as rotas de /tasks e /tasks/:taskId/items/:itemId/toggle
│   │   └── middlewares/
│   │       └── auth.middleware.js   # Valida o JWT e injeta req.userId antes das rotas protegidas
│   ├── drizzle.config.js            # Configuração do Drizzle Kit para geração de migrações
│   └── package.json                 # Dependências e scripts do backend
│
└── Frontend/
    ├── src/
    │   ├── main.jsx               # Monta o React no DOM e adiciona o Toaster global (Sonner)
    │   ├── App.jsx                # Configura o React Router com rotas públicas e protegidas
    │   ├── index.css              # Variáveis CSS do tema (shadcn) e diretivas do Tailwind
    │   ├── lib/
    │   │   ├── api.js             # Exporta API_URL como constante centralizada para todas as chamadas
    │   │   └── utils.js           # Utilitário cn() para mesclar classes Tailwind condicionalmente
    │   ├── pages/
    │   │   ├── Login.jsx          # Tela de login com validação Zod e react-hook-form
    │   │   ├── Register.jsx       # Tela de cadastro com indicador de força de senha
    │   │   └── Dashboard.jsx      # Tela principal: listagem, filtros, criação e edição de tarefas
    │   ├── components/
    │   │   ├── AppLogo.jsx        # Componente de logo/marca reutilizado nas páginas de autenticação
    │   │   ├── PasswordInput.jsx  # Input de senha com botão de mostrar/ocultar reutilizável
    │   │   ├── TaskFormDialog.jsx  # Modal para criar e editar tarefas, incluindo gerenciamento de itens
    │   │   └── ui/                # Componentes base do shadcn/ui (Button, Card, Badge, Dialog…)
    │   └── hooks/
    │       └── useTasks.js        # Hook customizado que encapsula todas as chamadas à API de tarefas
    ├── vite.config.js             # Configuração do Vite: plugin React e alias "@" para src/
    └── package.json               # Dependências e scripts do frontend
```

---

## Modelagem do Banco de Dados

### Tabela: `users`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `TEXT` | PK | UUID gerado automaticamente |
| `name` | `VARCHAR(255)` | NOT NULL | Nome completo do usuário |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Email de login (único) |
| `password_hash` | `TEXT` | NOT NULL | Hash bcrypt da senha |

### Enum: `task_status`

Valores possíveis: `pending` · `in_progress` · `completed`

### Tabela: `tasks`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `TEXT` | PK | UUID gerado automaticamente |
| `title` | `VARCHAR(255)` | NOT NULL | Título da tarefa |
| `description` | `TEXT` | nullable | Descrição opcional |
| `status` | `task_status` | NOT NULL, DEFAULT `pending` | Status atual da tarefa |
| `user_id` | `TEXT` | NOT NULL, FK → `users.id` | Usuário dono da tarefa |

### Tabela: `task_items`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `TEXT` | PK | UUID gerado automaticamente |
| `task_id` | `TEXT` | NOT NULL, FK → `tasks.id` | Tarefa à qual o item pertence |
| `text` | `TEXT` | NOT NULL | Texto do item de checklist |
| `completed` | `BOOLEAN` | NOT NULL, DEFAULT `false` | Estado de conclusão do item |
| `order` | `INTEGER` | NOT NULL, DEFAULT `0` | Posição do item na lista |

### Relacionamentos

```
users (1) ──< tasks (N) ──< task_items (N)
```

- Um usuário possui zero ou mais tarefas. Deleção do usuário remove todas as suas tarefas (`ON DELETE CASCADE`).
- Uma tarefa possui zero ou mais itens de checklist. Deleção da tarefa remove todos os seus itens (`ON DELETE CASCADE`).

---

## Funções Principais

### Backend

#### `auth.controller.js`

**`register(req, res)`**
- Valida presença de `name`, `email` e `password` (mínimo 6 caracteres)
- Normaliza o email com `trim()` e `toLowerCase()` antes de qualquer operação
- Aplica `trim()` no nome para evitar espaços nas pontas
- Verifica duplicidade de email no banco antes de inserir
- Gera hash da senha com `bcrypt.hash(password, 10)`
- Insere novo usuário e retorna os dados públicos (id, name, email)
- Respostas: `201 Created` ou `400 Bad Request`

**`login(req, res)`**
- Valida presença de `email` e `password`
- Normaliza o email com `trim()` e `toLowerCase()` para garantir consistência com o cadastro
- Busca usuário pelo email normalizado
- Compara senha com o hash via `bcrypt.compare`
- Em caso de sucesso, assina um JWT com `{ userId }` e expiração de 7 dias
- Retorna `{ token, user: { id, name, email } }`
- Respostas: `200 OK` ou `401 Unauthorized`

#### `tasks.controller.js`

**`getTasks(req, res)`**
- Busca todas as tarefas onde `user_id = req.userId` (extraído do JWT pelo middleware)
- Em seguida, busca todos os itens vinculados a essas tarefas via `inArray` em uma única query
- Retorna array de tarefas com `items[]` embutido, ordenados pelo campo `order`

**`createTask(req, res)`**
- Valida presença e conteúdo de `title` (rejeita strings com apenas espaços via `trim()`)
- Valida que `status`, se informado, é um dos valores permitidos
- Insere a tarefa associada ao usuário autenticado
- Se `items[]` for enviado, insere todos os itens vinculados à tarefa recém-criada
- Retorna a tarefa criada com `items[]` em `201 Created`

**`updateTask(req, res)`**
- Valida que `title`, se informado, não é vazio após `trim()`
- Valida que `status`, se informado, pertence ao enum de valores válidos
- A cláusula `WHERE id = :id AND user_id = req.userId` garante que o usuário só edita suas próprias tarefas
- Se `items[]` for enviado, substitui todos os itens da tarefa (delete-then-reinsert)
- Se `items` não for enviado, mantém os itens existentes inalterados
- Retorna tarefa atualizada com `items[]` ou `404 Not Found`

**`deleteTask(req, res)`**
- Deleta a tarefa `:id` pertencente ao usuário autenticado
- Os itens são removidos automaticamente via `ON DELETE CASCADE`
- Retorna `{ message }` ou `404 Not Found`

**`toggleItem(req, res)`**
- Verifica que a tarefa `:taskId` pertence ao usuário autenticado (ownership check)
- Verifica que o item `:itemId` pertence à tarefa informada
- Inverte o campo `completed` do item (`true` → `false` ou vice-versa)
- Retorna o item atualizado

#### `auth.middleware.js`

**`authenticate(req, res, next)`**
- Extrai o token do header `Authorization: Bearer <token>`
- Verifica e decodifica com `jwt.verify(token, JWT_SECRET)`
- Injeta `req.userId` para uso nos controllers
- Em caso de falha: `401 Unauthorized`

### Frontend

#### `useTasks.js` (hook customizado)

| Função | Descrição |
|---|---|
| `fetchTasks()` | `GET /tasks` — carrega todas as tarefas com `items[]` ao montar o componente |
| `createTask(data)` | `POST /tasks` — cria tarefa com itens e a adiciona no topo da lista local |
| `updateTask(id, data)` | `PUT /tasks/:id` — atualiza tarefa e itens, refletindo a mudança na lista local |
| `deleteTask(id)` | `DELETE /tasks/:id` — remove tarefa da lista local sem recarregar a página |
| `toggleItem(taskId, itemId)` | `PATCH /tasks/:taskId/items/:itemId/toggle` — inverte o estado de um item com atualização otimista e reversão em caso de erro |

Expõe: `{ tasks, isLoading, createTask, updateTask, deleteTask, toggleItem }`

#### `TaskFormDialog.jsx`

- Modal reutilizável para criar e editar tarefas
- Gerencia a lista de itens com `useFieldArray` do react-hook-form
- Valida que nenhum item tem texto vazio antes de enviar (erro inline por campo)
- Ao editar, pré-popula os itens existentes da tarefa no formulário
- Botão "Adicionar item" com borda tracejada; botão X para remover itens individualmente

#### `Dashboard.jsx` — `TaskCard`

- Renderiza descrição (se houver) seguida da lista de itens com checkboxes
- Checkbox implementado com `<button>` + SVG inline (sem dependência adicional)
- Item concluído exibe texto com `line-through` e opacidade reduzida
- Skeleton de loading em três variantes (`text`, `items`, `mixed`) para simular a altura real dos cards durante o carregamento

#### `App.jsx` — Roteamento

| Rota | Componente | Tipo | Comportamento |
|---|---|---|---|
| `/login` | `Login` | Pública | Redireciona para `/` se já autenticado |
| `/register` | `Register` | Pública | Redireciona para `/` se já autenticado |
| `/` | `Dashboard` | Privada | Redireciona para `/login` se sem token |

---

## Segurança Aplicada

### Hash de Senhas
As senhas nunca são armazenadas em texto plano. O bcrypt é usado com fator de custo 10, tornando ataques de força bruta computacionalmente inviáveis. O hash é gerado no momento do cadastro e verificado no login via `bcrypt.compare`.

### Proteção de Rotas Privadas
Todas as rotas de tarefas (`/tasks`) passam pelo middleware `authenticate` antes de chegar aos controllers. O middleware rejeita qualquer requisição sem um JWT válido. No frontend, `PrivateRoute` verifica a presença do token em `localStorage` e redireciona para `/login` caso ausente.

### Isolamento de Dados por Usuário
Cada operação de leitura, atualização e deleção de tarefas filtra por `user_id = req.userId`, onde `req.userId` vem do token JWT verificado. A rota de toggle de item verifica o ownership da tarefa pai antes de qualquer modificação no item. Isso impede que um usuário acesse ou modifique dados de outros usuários, mesmo conhecendo IDs.

### Validação e Sanitização de Input
- **Backend:** Validação manual dos campos obrigatórios antes de qualquer operação no banco. `title` e `name` passam por `trim()` para rejeitar strings compostas apenas de espaços. O campo `status` é validado contra a lista de valores permitidos do enum. Email é normalizado com `trim()` e `toLowerCase()`.
- **Frontend:** Schemas Zod validam os formulários com react-hook-form antes do envio. Itens de checklist com texto vazio bloqueiam o submit com erro inline. Dados inválidos não chegam à API.

### Proteção contra SQL Injection
O Drizzle ORM gera exclusivamente queries parametrizadas (ex: `WHERE email = $1`). Não há nenhuma concatenação direta de strings em queries SQL no código, eliminando completamente o risco de SQL Injection.

### Proteção contra XSS
O React escapa automaticamente todo conteúdo renderizado via JSX, prevenindo a execução de scripts maliciosos injetados em títulos, descrições ou itens de tarefas. O backend retorna exclusivamente JSON, nunca HTML, eliminando vetores de XSS na camada de API.

### Tratamento de Erros
O backend retorna mensagens de erro genéricas para falhas de autenticação (evitando enumerar usuários existentes) e para erros internos do servidor (`500`), sem expor stack traces, mensagens do banco de dados ou detalhes de implementação. Erros são registrados internamente via `console.error` para fins de depuração.

---

## Fluxo de Uso do Sistema

```
1. Acesso inicial
   └─> Usuário acessa a aplicação
       ├─> Sem token → redirecionado para /login
       └─> Com token válido → redirecionado para /dashboard

2. Cadastro
   └─> Usuário preenche nome, email e senha em /register
       ├─> Frontend valida o formulário (Zod)
       ├─> POST /auth/register
       ├─> Backend valida, cria hash da senha e salva no banco
       └─> Sucesso → redirecionado para /login

3. Login
   └─> Usuário preenche email e senha em /login
       ├─> POST /auth/login
       ├─> Backend verifica credenciais e emite JWT (7 dias)
       ├─> Frontend salva token e dados do usuário no localStorage
       └─> Redirecionado para /dashboard

4. Gerenciamento de Tarefas
   ├─> Dashboard carrega todas as tarefas com itens (GET /tasks com JWT)
   ├─> Filtrar: botões "Todas / Pendentes / Em andamento / Concluídas"
   ├─> Criar: clica em "Nova Tarefa" → preenche modal (título, descrição, itens, status) → POST /tasks
   ├─> Marcar/desmarcar item: clica no checkbox do item → PATCH /tasks/:taskId/items/:itemId/toggle
   ├─> Editar: clica no ícone de lápis → modal pré-preenchido com itens → PUT /tasks/:id
   ├─> Concluir/reabrir tarefa: clica no ícone de status no rodapé do card
   └─> Deletar: clica no ícone de lixeira → confirmação → DELETE /tasks/:id

5. Logout
   └─> Usuário confirma saída → token e dados removidos do localStorage → /login
```

---

## Instalação e Execução Local

### Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Banco de dados PostgreSQL acessível (local ou Neon/cloud)

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd Todo-List
```

### 2. Configurar e iniciar o Backend

```bash
cd Backend
npm install
```

Crie o arquivo `.env` na pasta `Backend/` com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=sua_chave_secreta_aqui
```

Aplique as migrações do banco de dados:

```bash
npx drizzle-kit push
```

Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3000`.

### 3. Configurar e iniciar o Frontend

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### Rotas da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | — | Cadastro de novo usuário |
| `POST` | `/auth/login` | — | Login e emissão de JWT |
| `GET` | `/tasks` | JWT | Lista todas as tarefas do usuário com itens |
| `POST` | `/tasks` | JWT | Cria uma nova tarefa (com itens opcionais) |
| `PUT` | `/tasks/:id` | JWT | Atualiza uma tarefa e seus itens |
| `DELETE` | `/tasks/:id` | JWT | Remove uma tarefa e seus itens (cascade) |
| `PATCH` | `/tasks/:taskId/items/:itemId/toggle` | JWT | Alterna o estado de conclusão de um item |

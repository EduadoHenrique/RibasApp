# RibasApp Frontend

Frontend da aplicação **RibasApp**, desenvolvido em HTML, CSS e JavaScript puro, estruturado como uma SPA (Single Page Application) com roteamento via hash e integração completa com a API REST do backend.

A aplicação foi criada para gerenciamento operacional de guindastes e frota industrial, centralizando o controle de operadores, veículos e documentação obrigatória em um único sistema interno.

---

# Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (ES Modules)
* Fetch API
* JWT (autenticação via token)
* qrcode-generator

---

# Funcionalidades

## Autenticação
* Login com matrícula e senha
* Redirecionamento automático por perfil de usuário
* Proteção de rotas por role
* Fluxo de primeiro acesso com troca obrigatória de senha
* Logout

## Painel RH
* Listagem de operadores cadastrados
* Indicadores de CNH vencendo, ASOs pendentes e operadores ativos
* Acesso rápido ao cadastro e edição de operadores

## Painel Admin
* Listagem de veículos da frota
* Indicadores de documentos vencendo, veículos bloqueados e operação ativa
* Acesso rápido ao cadastro e edição de veículos

## Painel Operador
* Visualização dos veículos vinculados ao operador logado
* Indicadores de status dos seus equipamentos

## Gestão de Operadores
* Cadastro de novo operador com definição de nível de acesso
* Edição de dados e alteração de role
* Desativação com preservação de histórico

## Gestão de Veículos
* Cadastro de veículo com categoria, placa, capacidade e status
* Edição de dados operacionais
* Anexo de documentos via link externo (Google Drive, OneDrive etc.)
* Remoção de documentos
* Geração e download de QR Code da ficha do veículo
* Desativação com preservação de histórico

## Perfil
* Visualização dos dados pessoais do usuário logado
* Alteração de senha

---

# Arquitetura

```text
index.html (único arquivo HTML)
↓
scripts/router.js (SPA router com guard de autenticação)
↓
views/*.js (cada tela como módulo JS independente)
↓
scripts/api.js (cliente HTTP centralizado → Backend Node.js)
```

---

# Estrutura do Projeto

```text
RibasApp/
│
├── index.html
│
├── scripts/
│   ├── api.js        ← cliente HTTP + RibasAPI
│   └── router.js     ← roteamento SPA + guard de auth
│
├── views/
│   ├── login.js
│   ├── home.js
│   ├── profile.js
│   ├── new-user.js
│   ├── new-vehicle.js
│   ├── vehicle.js
│   └── not-authorized.js
│
├── style.css
└── vercel.json
```

---

# Roteamento

A navegação é feita via hash da URL, sem recarregar a página:

| Hash | Tela | Acesso |
|---|---|---|
| `#login` | Login | Público |
| `#home` | Painel principal | Todos os usuários logados |
| `#profile` | Meu perfil | Todos os usuários logados |
| `#new-user` | Cadastro de operador | Admin, RH |
| `#new-user?id=:id` | Edição de operador | Admin, RH |
| `#new-vehicle` | Cadastro de veículo | Admin |
| `#vehicle?id=:id` | Ficha do veículo | Todos os usuários logados |
| `#not-authorized` | Acesso negado | Público |

---

# Guard de Autenticação

O `router.js` protege todas as rotas automaticamente antes de renderizar qualquer tela:

* Sem token → redireciona para `#login`
* Token expirado → limpa sessão e redireciona para `#login`
* Role insuficiente → redireciona para `#not-authorized`
* Usuário logado tentando acessar `#login` → redireciona para `#home`

---

# Níveis de Acesso

| Tipo no backend | Role no frontend | Acesso |
|---|---|---|
| `ADMIN` | `admin` | Painel de veículos, cadastro e edição de veículos, gestão de documentos |
| `GESTOR` | `rh` | Painel de operadores, cadastro e edição de operadores |
| `OPERADOR` | `operador` | Apenas seus próprios veículos e perfil |

---

# Integração com o Backend

Toda comunicação com a API é feita pelo objeto global `RibasAPI` definido em `scripts/api.js`:

```js
RibasAPI.Auth.login(matricula, senha)
RibasAPI.Auth.changePassword(novaSenha)
RibasAPI.Auth.logout()

RibasAPI.Users.list()
RibasAPI.Users.getById(id)
RibasAPI.Users.create(data)
RibasAPI.Users.update(id, data)
RibasAPI.Users.getRole(id)
RibasAPI.Users.updateRole(id, tipoUsuario)
RibasAPI.Users.remove(id)

RibasAPI.Veiculos.list()
RibasAPI.Veiculos.getById(id)
RibasAPI.Veiculos.create(data)
RibasAPI.Veiculos.update(id, data)
RibasAPI.Veiculos.remove(id)

RibasAPI.DocumentosVeiculo.list()
RibasAPI.DocumentosVeiculo.create(data)
RibasAPI.DocumentosVeiculo.remove(id)
```

Token JWT enviado automaticamente no header de todas as requisições autenticadas:

```http
Authorization: Bearer TOKEN
```

---

# Como Executar Localmente

Clone o repositório:

```bash
git clone https://github.com/Janeckiisa/RibasApp
```

Entre na pasta:

```bash
cd RibasApp
```

Abra com qualquer servidor estático. Exemplo com Live Server (VS Code) ou:

```bash
npx serve .
```

Acesse `http://localhost:3000` no navegador.

> O frontend consome a API hospedada no Render. Não é necessário rodar o backend localmente.

---

# Deploy

Link do deploy no Vercel: [Ribas App](https://ribas-app-9cs4.vercel.app/)

---

# Repositório do Backend

[RibasApp Backend](https://github.com/Janeckiisa/RibasApp-Backend)

API hospedada em: https://ribasapp-backend.onrender.com

---

# Desenvolvedores

Projeto desenvolvido para a disciplina de **Jornada de Aprendizagem** — empresa parceira **Guindastes Ribas**, curso de **Engenharia de Software**.

| Nome | GitHub |
|---|---|
| Isabelle | [@Janeckiisa](https://github.com/Janeckiisa) |
| Eduardo Henrique | [@EduadoHenrique](https://github.com/EduadoHenrique) |
| Eduardo William | [@Eduardo2214](https://github.com/Eduardo2214) |
| Matheus | — |

# CineScope

Aplicação web full stack para descobrir filmes em alta e montar uma biblioteca pessoal de filmes assistidos. Os dados e as imagens dos filmes são fornecidos pela API do TMDB.

Projeto desenvolvido como Atividade Final de Frameworks — UniSenac.

## Funcionalidades

- Cadastro de usuário com nome, e-mail e senha.
- Login e logout com autenticação JWT.
- Rotas protegidas no frontend e no backend.
- Listagem de filmes em alta na página inicial.
- Busca de filmes por título.
- Adição de filmes à biblioteca pessoal.
- Indicação de filmes que já estão na biblioteca.
- Remoção de filmes da biblioteca.
- Bloqueio de filmes duplicados por usuário.
- Atualização do nome de exibição no perfil.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Banco de dados | MongoDB, Mongoose |
| API externa | TMDB API v3 |
| Deploy | Render (frontend e backend) e MongoDB Atlas |

## Arquitetura

```text
Navegador (React SPA)
   │  HTTPS + Authorization: Bearer <JWT>
   ▼
API Express
   ├── Mongoose ──► MongoDB Atlas
   └── fetch ─────► https://api.themoviedb.org/3
```

O backend é o único responsável por acessar o TMDB. A chave da API nunca é enviada ao navegador.

## Estrutura do projeto

```text
cinescope/
├── client/                 # React + Vite
│   ├── src/
│   │   ├── components/     # Navbar, MovieCard, MovieGrid, estados de tela
│   │   ├── contexts/       # AuthContext
│   │   ├── pages/          # Login, Register, Home, Library, Profile
│   │   ├── services/       # Cliente HTTP da API
│   │   └── utils/          # Formatação e mensagens de erro
│   ├── Dockerfile          # Build do frontend + Nginx
│   └── nginx.conf          # SPA e proxy de /api para o backend
├── server/                 # Express + TypeScript
│   ├── src/
│   │   ├── config/         # Ambiente e conexão com o MongoDB
│   │   ├── controllers/    # Regras de cada rota
│   │   ├── middlewares/    # Autenticação, validação e erros
│   │   ├── models/         # User e Movie
│   │   ├── routes/         # Rotas REST
│   │   ├── services/       # Integração com o TMDB
│   │   └── utils/          # AppError, mappers e helpers
│   └── Dockerfile          # Build e execução da API
├── docker-compose.yaml     # MongoDB, backend e frontend
├── .env.example
├── render.yaml
└── README.md
```

## Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Docker (recomendado para o MongoDB local) ou uma instância MongoDB.
- Conta no TMDB com uma API Key ou Read Access Token.

## Configuração do ambiente

Crie o arquivo `.env` na raiz do repositório:

```bash
cp .env.example .env
```

O servidor carrega o `.env` da raiz do projeto.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `TMDB_API_KEY` | Sim | API Key v3 ou Read Access Token do TMDB |
| `MONGODB_URI` | Sim em produção | String de conexão do MongoDB |
| `JWT_SECRET` | Sim em produção | Segredo usado para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Não | Validade do token (padrão: `7d`) |
| `CLIENT_ORIGIN` | Não | Origens permitidas pelo CORS, separadas por vírgula. Aceita `*` ou padrões como `https://*.onrender.com` |
| `PORT` | Não | Porta do servidor (padrão: `4000`) |
| `NODE_ENV` | Não | `development` ou `production` |

O backend aceita tanto a API Key v3 quanto o Read Access Token do TMDB. Quando o valor é um Read Access Token, a autenticação é feita com `Authorization: Bearer`. Quando é uma API Key v3, a chave é enviada como parâmetro `api_key`, sempre no backend.

Para liberar qualquer origem no CORS, use `CLIENT_ORIGIN=*`. Também é possível usar padrões com `*`, como `CLIENT_ORIGIN=https://*.onrender.com`.

No frontend, a única variável necessária é `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:4000
```

Se ela não for definida, o cliente usa `http://localhost:4000`. Essa variável é usada apenas no modo de desenvolvimento local. Na imagem Docker, o frontend chama `/api` no mesmo domínio e o Nginx encaminha as requisições para o backend.

## Como rodar localmente

1. Inicie o MongoDB com Docker:

```bash
docker run -d --name cinescope-mongo -p 27017:27017 mongo:7
```

Se o container já existir, use:

```bash
docker start cinescope-mongo
```

2. Inicie o backend:

```bash
cd server
npm install
npm run dev
```

3. Em outro terminal, inicie o frontend:

```bash
cd client
npm install
npm run dev
```

4. Acesse `http://localhost:5173`.

A API fica disponível em `http://localhost:4000`. O endpoint de saúde é `GET /api/health`.

## Como rodar com Docker Compose

Com Docker e Docker Compose instalados e o `.env` configurado na raiz, basta executar:

```bash
docker compose up --build
```

O comando inicia os três serviços:

| Serviço | Descrição | Endereço |
| --- | --- | --- |
| `mongo` | MongoDB 7 com volume persistente | Apenas na rede interna |
| `server` | API Express compilada | `http://localhost:4000` |
| `client` | Build do React servido por Nginx | `http://localhost:5173` |

O Nginx entrega os arquivos estáticos, aplica o fallback da SPA e encaminha `/api` para o backend. Assim, o navegador acessa tudo pela mesma origem, sem necessidade de configurar CORS ou `VITE_API_URL`.

O Compose lê `TMDB_API_KEY` e `JWT_SECRET` do `.env` e define internamente `NODE_ENV=production` e `MONGODB_URI=mongodb://mongo:27017/cinescope`.

Comandos úteis:

```bash
docker compose up -d --build   # sobe em segundo plano
docker compose logs -f         # acompanha os logs
docker compose down            # para e remove os containers
docker compose down -v         # para e remove também os dados do MongoDB
docker compose exec mongo mongosh cinescope   # acessa o banco
```

## Scripts

### Backend

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor com recarga automática |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Executa a versão compilada |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |

### Frontend

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o Vite em modo de desenvolvimento |
| `npm run build` | Verifica os tipos e gera o build de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |

## API REST

Todas as rotas usam o prefixo `/api`. As mensagens de erro da API são em inglês; a interface traduz os casos relevantes para português.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Pública | Cria a conta e retorna token e usuário |
| `POST` | `/api/auth/login` | Pública | Autentica e retorna token e usuário |
| `GET` | `/api/auth/me` | JWT | Retorna o usuário da sessão |
| `GET` | `/api/movies/trending` | Opcional | Lista os filmes em alta da semana |
| `GET` | `/api/movies/search?query=` | Opcional | Busca filmes por título |
| `GET` | `/api/library` | JWT | Lista a biblioteca do usuário |
| `POST` | `/api/library` | JWT | Adiciona um filme pelo `tmdbId` |
| `DELETE` | `/api/library/:id` | JWT | Remove um filme da biblioteca |
| `PATCH` | `/api/users/me` | JWT | Atualiza o nome de exibição |
| `GET` | `/api/health` | Pública | Verifica se a API está no ar |

Exemplos:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Silva","email":"ana@example.com","password":"secret123"}'
```

```bash
curl -X POST http://localhost:4000/api/library \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tmdbId":157336}'
```

O `POST /api/library` recebe apenas o `tmdbId`. O backend consulta os detalhes no TMDB e grava os dados do filme, evitando que o cliente envie informações arbitrárias.

## Integração com o TMDB

Endpoints utilizados pelo backend:

- `GET /trending/movie/week?language=pt-BR`
- `GET /search/movie?query=...&language=pt-BR&page=1&include_adult=false`
- `GET /movie/{movie_id}?language=pt-BR`

As imagens usam a base `https://image.tmdb.org/t/p/w500`. O banco armazena o `posterPath` e o `tmdbId`; a URL completa é montada pela API.

## Segurança

- Senhas armazenadas com hash bcrypt (custo 10) e nunca retornadas pela API.
- Tokens JWT assinados com segredo de ambiente e validade configurável.
- Rotas de biblioteca e perfil protegidas no backend e no frontend.
- Validação de tipos, tamanhos, e-mail e identificadores.
- CORS restrito às origens configuradas. O valor `*` libera qualquer origem e deve ser usado apenas quando necessário.
- Limite de tamanho do corpo JSON.
- Tratamento centralizado de erros sem vazar detalhes internos em produção.
- Chave do TMDB mantida apenas no backend.
- Consultas da biblioteca sempre filtradas pelo usuário autenticado.

## Deploy no Render

O arquivo `render.yaml` define dois serviços:

- `cinescope-api`: Web Service Node com o backend.
- `cinescope-web`: Static Site com o frontend.

Passos:

1. Crie um cluster gratuito no MongoDB Atlas.
2. Crie um usuário do banco e libere o acesso de rede (`0.0.0.0/0`, pois o Render Free não possui IP de saída fixo).
3. Copie a string de conexão, incluindo o nome do banco `cinescope`.
4. Envie o repositório para o GitHub.
5. No Render, crie um Blueprint apontando para o repositório.
6. Preencha as variáveis solicitadas:

| Serviço | Variável | Valor |
| --- | --- | --- |
| `cinescope-api` | `MONGODB_URI` | String de conexão do Atlas |
| `cinescope-api` | `TMDB_API_KEY` | API Key ou Read Access Token do TMDB |
| `cinescope-api` | `CLIENT_ORIGIN` | URL do frontend, por exemplo `https://cinescope-web.onrender.com` |
| `cinescope-web` | `VITE_API_URL` | URL do backend, por exemplo `https://cinescope-api.onrender.com` |

O `JWT_SECRET` é gerado automaticamente pelo Render.

O plano gratuito do Render suspende o backend após um período de inatividade. A primeira requisição depois disso pode levar alguns segundos.

## Decisões técnicas

- Autenticação stateless com JWT armazenado no `localStorage` e enviado no cabeçalho `Authorization`. O logout é feito no cliente.
- Página inicial pública. A biblioteca e o perfil exigem autenticação.
- Busca de filmes incluída como parte da integração com o TMDB.
- `POST /api/library` recebe somente o `tmdbId` e busca os dados no TMDB.
- Índice único composto `{ userId, tmdbId }` para impedir duplicidades.
- Sem bibliotecas de estado, formulários ou validação além do necessário.
- Verificação manual por meio de requisições HTTP e da interface, sem framework de testes automatizados.

## Checklist de requisitos

| Requisito | Implementação |
| --- | --- |
| Cadastro | `POST /api/auth/register` e página de cadastro |
| Login | `POST /api/auth/login` e página de login |
| Logout | Remoção do token no `AuthContext` |
| Hash de senha | bcrypt no cadastro e comparação no login |
| JWT | `jsonwebtoken` com `subject` e expiração |
| Rotas protegidas | `requireAuth` e `ProtectedRoute` |
| Filmes em alta | `GET /api/movies/trending` e página inicial |
| Pôster, título, data, nota e sinopse | `MovieCard` |
| Adicionar à biblioteca | `POST /api/library` |
| Indicador de filme salvo | Campo `inLibrary` |
| Listar biblioteca | `GET /api/library` e página Minha Biblioteca |
| Remover da biblioteca | `DELETE /api/library/:id` |
| Evitar duplicidade | Índice único e resposta `409` |
| Dados do filme no MongoDB | Modelo `Movie` |
| Atualizar nome | `PATCH /api/users/me` e página de perfil |
| CRUD completo | Criar, ler, atualizar e remover filmes; atualizar o usuário |
| Chave do TMDB protegida | Acesso apenas pelo backend |
| CORS e validação | Middlewares e configuração de ambiente |
| Deploy | `render.yaml` |
| README em português | Este arquivo |

## Créditos

This product uses the TMDB API but is not endorsed or certified by TMDB.

Dados e imagens de filmes fornecidos pelo [The Movie Database (TMDB)](https://www.themoviedb.org).

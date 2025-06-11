# Anime Search

Este é um sistema completo de recomendação de animes, com frontend em React, backend com banco de dados PostgreSQL via Docker e suporte a novos usuários com recomendações baseadas em Collaborative Filtering.

## Funcionalidades

- 🔍 Pesquisa de animes por nome
- 🎬 Visualização de detalhes, sinopse, trailer e personagens
- 🗂️ Listagens dos animes mais bem avaliados e mais populares
- 👤 Sistema de login e registro (com JWT)
- ❤️ Adição de animes assistidos e notas por usuários
- 🤝 Recomendação personalizada para novos usuários com base em notas
- 🔗 Integração com a API [Jikan](https://jikan.moe/) (MyAnimeList)

---

## Tecnologias Utilizadas

### Frontend
- React + React Router
- TailwindCSS / CSS Modules

### Backend
- PostgreSQL (via Docker)
- Python (FastAPI)

### Recomendação
- Collaborative Filtering (User-Based ou Item-Based) via `surprise` ou `scikit-learn` (Python)

---

## Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/QTelesGabriel/Anime-Search
cd Anime-Search
````

### 2. Suba o banco de dados com Docker

```bash
cd backend
docker-compose up -d
```

### 3. Instale as dependências do frontend

```bash
cd frontend
npm install
```

### 4. Rode o frontend

```bash
npm run dev
```

> O projeto estará disponível em `http://localhost:5173` (Vite)


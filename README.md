<div align="center">

# 🚀 Trainify API

API REST do aplicativo Trainify para gerenciar treinos, exercícios, sessões, métricas e evolução do usuário.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.9-000000?logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest&logoColor=white)

---

📃 [Sobre](#-sobre) •
🛠️ [Tecnologias](#️-tecnologias) •
✨ [Funcionalidades](#-funcionalidades) •
🚀 [Como rodar](#-como-rodar) •
📖 [Documentação](#-documentação-da-api) •
🧪 [Testes](#-testes)

</div>

---

## 📃 Sobre

A Trainify API é o backend do aplicativo Trainify, responsável por fornecer uma camada REST para cadastro e acompanhamento de treinos. A aplicação permite gerenciar exercícios, criar e finalizar sessões de treino, registrar pesos, acompanhar métricas e consumir dados de progresso com uma estrutura organizada em módulos.

O projeto foi construído com Fastify, TypeScript, Prisma ORM e PostgreSQL, com foco em performance, tipagem forte e documentação interativa via Swagger.

---

## 🛠️ Tecnologias

- 🟢 [Node.js](https://nodejs.org/) — Ambiente de execução JavaScript server-side.
- ⚡ [Fastify](https://fastify.dev/) — Framework web rápido e eficiente.
- 🔷 [TypeScript](https://www.typescriptlang.org/) — Tipagem estática e maior segurança no desenvolvimento.
- 🗃️ [Prisma ORM](https://www.prisma.io/) — ORM moderno e type-safe para integração com bancos relacionais.
- 🐘 [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional robusto.
- 🐳 [Docker](https://www.docker.com/) — Containerização do banco de dados local.
- 📖 [Swagger](https://swagger.io/) — Documentação interativa da API.
- 🧪 [Vitest](https://vitest.dev/) — Testes automatizados.
- 🧩 [Zod](https://zod.dev/) — Validação de entradas e contratos de dados.
- 🔍 [Biome](https://biomejs.dev/) — Linting e formatação de código.

---

## ✨ Funcionalidades

- [x] 🏋️ Cadastro e gestão de exercícios
- [x] 🗓️ Criação de treinos e planos de treino
- [x] ⏱️ Início, pausa e finalização de sessões de treino
- [x] 📝 Registro de logs de exercícios
- [x] ⚖️ Acompanhamento de peso e metas de peso
- [x] 📊 Geração de métricas e progresso do usuário
- [x] 🏆 Módulo de gamificação e evolução do perfil
- [x] 🔐 Autenticação via JWT
- [x] 🛡️ Validação de dados com Zod
- [x] 📖 Documentação interativa da API com Swagger
- [x] 🧪 Testes automatizados com Vitest

---

## 🚀 Como rodar

### 📋 Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)

### 🔧 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/trainify-api.git
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd trainify-api
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Exemplo de conteúdo:

   ```env
   NODE_ENV=dev
   PORT=3333
   JWT_SECRET=seu_jwt_secret
   DATABASE_URL="postgresql://docker:docker@localhost:5432/trainify?schema=public"
   ```

### 🐳 Banco de dados

Suba o container do PostgreSQL com Docker:

```bash
docker compose up -d
```

Execute as migrations do Prisma:

```bash
npm run migrate
```

Opcionalmente, rode os seeds para popular o banco:

```bash
npm run seed
```

### ▶️ Execução

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em http://localhost:3333.

---

## 📖 Documentação da API

Com o servidor rodando, acesse a documentação interativa do Swagger em:

- http://localhost:3333/docs

Também existe um endpoint de health check disponível em:

- http://localhost:3333/health

---

## 🧪 Testes

Os testes são executados com Vitest e cobrem os principais fluxos da aplicação.

```bash
# Executa todos os testes
npm run test

# Executa os testes em modo watch
npm run test:watch

# Gera relatório de cobertura
npm run test:coverage
```

---

## 📁 Estrutura do projeto

```txt
src/
  modules/
    exercise/
    gamification/
    metric/
    session/
    user/
    weight/
    workout/
  lib/
  env/
```

---

## ⭐ Contribuição

Contribuições são bem-vindas. Caso queira colaborar, abra uma issue ou envie um pull request com as melhorias propostas.

---

## ⭐ Apoie este Projeto

Se curtiu o projeto, deixe uma ⭐ aqui no GitHub — isso ajuda muito!

---

<div align="center">

Feito com ♥ por **[João Otávio Schonarth](https://github.com/joschonarth)**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joschonarth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joschonarth)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:joschonarth@gmail.com)

</div>

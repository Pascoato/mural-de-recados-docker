# Mural de Recados

Aplicação simples de mural de recados: qualquer pessoa pode escrever seu
nome e uma mensagem, publicar e ver a lista de recados já deixados. Feita
para o Trabalho Avaliativo de Docker e GitHub da disciplina de Computação
em Nuvem.

- **Back-end:** Node.js + Express
- **Banco de dados:** PostgreSQL
- **Persistência:** volume nomeado do Docker

## O que é preciso ter instalado

- [Docker](https://docs.docker.com/get-docker/) (versão com o plugin
  `docker compose` incluso)

Não é necessário instalar Node.js, npm ou PostgreSQL na máquina — tudo
roda dentro dos containers.

## Como subir o ambiente

```bash
git clone https://github.com/Pascoato/mural-de-recados-docker.git
cd mural-de-recados-docker
cp .env.example .env
docker compose up -d
```

O primeiro comando `docker compose up` constrói a imagem da aplicação,
baixa a imagem do PostgreSQL, sobe os dois serviços e só libera a
aplicação depois que o banco responder ao `healthcheck`.

Para acompanhar os logs:

```bash
docker compose logs -f app
```

## Como acessar a aplicação

Depois que os serviços estiverem no ar, acesse:

```
http://localhost:8000
```

Preencha o nome e a mensagem no formulário e clique em **Publicar
recado**. A lista é atualizada e ordenada do mais recente para o mais
antigo.

## Persistência dos dados

Os dados do banco ficam em um volume nomeado (`dados_db`), então
sobrevivem a um `docker compose down`:

```bash
docker compose down     # para os containers, mantém os dados
docker compose up -d    # sobe de novo, recados continuam lá
```

Para apagar também os dados (reset completo):

```bash
docker compose down -v
```

## Variáveis de ambiente

Configuradas em `.env` (a partir de `.env.example`, que não contém
segredos reais):

| Variável      | Descrição                              |
|---------------|-----------------------------------------|
| `DB_USER`     | Usuário do PostgreSQL                   |
| `DB_PASSWORD` | Senha do PostgreSQL                     |
| `DB_NAME`     | Nome do banco de dados                  |

A aplicação recebe a string de conexão completa (`DATABASE_URL`) já
montada pelo `docker-compose.yml`, usando o nome do serviço `db` como
host — nunca `localhost` ou um IP fixo.

## Estrutura do repositório

```
mural-de-recados-docker/
├── app/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Testando a própria entrega

```bash
git clone https://github.com/Pascoato/mural-de-recados-docker.git teste
cd teste
cp .env.example .env
docker compose up -d
```

Se a aplicação abrir em `http://localhost:8000` e o formulário salvar um
recado, o ambiente está funcionando como esperado.

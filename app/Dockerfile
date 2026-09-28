# Imagem oficial do Node.js, versão LTS, variante "slim" (menor tamanho)
FROM node:22-slim

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia primeiro apenas os manifestos de dependências.
# Isso aproveita o cache de camadas do Docker: o "npm install" só roda de
# novo quando package.json/package-lock.json mudam, não a cada alteração
# no código-fonte.
COPY package*.json ./

RUN npm install --omit=dev

# Agora copia o restante do código da aplicação
COPY . .

# Porta em que a aplicação Express escuta dentro do container
EXPOSE 3000

# Comando executado quando o container inicia
CMD ["node", "server.js"]

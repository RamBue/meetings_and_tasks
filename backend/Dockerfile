FROM node:24-alpine
WORKDIR /app

# Zuerst nur package*.json kopieren, damit der npm-Schritt gecached wird
COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

# Upload-Ordner anlegen, damit der User "node" hineinschreiben darf
RUN mkdir -p uploads/protocols && chown -R node:node uploads

USER node
EXPOSE 5002
CMD ["node", "src/server.js"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 4000
EXPOSE 5173

CMD ["npm", "run", "backend"]

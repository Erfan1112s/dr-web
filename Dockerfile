FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# دستور در docker-compose.yml اوورراید خواهد شد
CMD ["npm", "run", "dev"]
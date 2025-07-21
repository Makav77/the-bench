FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY .env .env
COPY . .

ENV NODE_OPTIONS=--max_old_space_size=8192

CMD ["npm", "run", "start:dev"]

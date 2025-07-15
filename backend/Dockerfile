FROM node

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY .env .env
COPY . .

CMD ["npm", "run", "start:dev"]

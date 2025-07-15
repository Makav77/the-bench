FROM node:18 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install


COPY .env .env
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

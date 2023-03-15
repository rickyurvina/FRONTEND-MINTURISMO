#stage 1
#stage 1
FROM node:16.14.2 as node

WORKDIR /usr/src/app

COPY . .

RUN npm install  && npm run build:prod

#stage 2
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node /usr/src/app/dist/enlink /usr/share/nginx/html
EXPOSE 80


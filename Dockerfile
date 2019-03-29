# stage: 1
FROM node AS react-build

#COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /app

COPY . ./

RUN yarn

RUN yarn build

# stage: 2 - the production environment
#FROM nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=react-build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
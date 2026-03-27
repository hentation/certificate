FROM nexus.urfu.ru/node:lts-alpine AS build
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node package.json .npmrc ./
RUN npm config set registry https://nexus.urfu.ru/repository/npm/ && \
    npm config set @*:registry https://nexus.urfu.ru/repository/npm/ && \
    npm install --registry https://nexus.urfu.ru/repository/npm/ || \
    npm install --registry https://registry.npmjs.org/
# RUN npm install
# RUN npm --registry https://nexus.urfu.ru/repository/npm/ install
COPY --chown=node . .

WORKDIR /home/node/app

ARG KEYCLOAK_REALM
ENV VITE_KEYCLOAK_REALM=$KEYCLOAK_REALM

ARG KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID

ARG KEYCLOAK_URL
ENV VITE_KEYCLOAK_URL=$KEYCLOAK_URL

ARG API_PATH
ENV VITE_API_PATH=$API_PATH

ARG BASE_URL
ENV BASE_URL=$BASE_URL

RUN npm run build -- --base=$BASE_URL
WORKDIR /home/node/app

### STAGE 2: Run ###
FROM nexus.urfu.ru/nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/app/dist/ /usr/share/nginx/html
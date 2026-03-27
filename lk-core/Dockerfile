FROM nexus.urfu.ru/node:lts-alpine as build

WORKDIR /usr/app
COPY package.json .
RUN npm --registry https://nexus.urfu.ru/repository/npm/ install

COPY . .
RUN npm run build

ENV NODE_ENV production
RUN npm --registry https://nexus.urfu.ru/repository/npm/ install --omit=dev


FROM nexus.urfu.ru/node:lts-alpine As production

COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/src ./src
COPY --from=build /usr/app/description-files ./description-files
COPY --from=build /usr/app/package.json ./

USER node

CMD ["npm", "run", "start:prod"]

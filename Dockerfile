FROM node:20.18.0-alpine
WORKDIR /app
COPY package*.json .
RUN yarn
COPY . .
RUN yarn build
RUN yarn install --production
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "build"]
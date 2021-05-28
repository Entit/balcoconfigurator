FROM node:14.15.0
ENV NODE_ENV=production
WORKDIR /src
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
RUN npm build
COPY . .
CMD ["npm", "start"]
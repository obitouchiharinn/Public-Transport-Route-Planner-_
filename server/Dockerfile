FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build

EXPOSE 16300

CMD ["npm", "run", "ash"]

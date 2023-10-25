FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# copy result of our app souce code into container working dir -> app 
COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
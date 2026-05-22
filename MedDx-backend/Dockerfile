FROM node:18.20.2-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Now copy rest of the code
COPY . .

EXPOSE 5555

ENV NODE_ENV=production
ENV PORT=5555


CMD ["npm", "run", "start"]
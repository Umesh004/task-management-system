FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Dummy value only for build-time Prisma generate
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_management"

RUN npx prisma generate

RUN npm run build

EXPOSE 5001

CMD ["npm", "run", "start"]
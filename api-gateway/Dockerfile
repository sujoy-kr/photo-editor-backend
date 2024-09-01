FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production \
    && npm cache clean --force \
    && rm -rf /var/cache/apk/* /tmp/*

COPY . .

EXPOSE 2000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:2000/ || exit 1

CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production \
    && npm cache clean --force \
    && rm -rf /var/cache/apk/* /tmp/*

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN mkdir -p uploads && chown -R appuser:appgroup uploads

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:4000/ || exit 1

CMD ["npm", "start"]

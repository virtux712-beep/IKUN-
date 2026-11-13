# ---------- 构建阶段 ----------
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

# 先只拷依赖清单，命中缓存时跳过重新安装
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---------- 运行阶段 ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
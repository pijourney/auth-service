FROM --platform=linux/arm64 ghcr.io/pijourney/service-provisioner:1.0.1

COPY /resources/database/schema.sql ${INIT_DIR}

ENV SERVICE_NAME="auth-service"
ENV DB_NAME="auth-service-db"

#!/bin/bash
set -e

echo "========================================================="
echo " Starting running backend, frontend and docker compose "

echo "starting docker compose"
docker-compose up -d

echo "Waiting for docker-compose to be ready "
sleep 10

echo " Successfully starting containers"

# Dấu & ở cuối để đẩy backend chạy ngầm
# Dấu ngoặc đơn () để chạy trong subshell, không làm đổi thư mục hiện tại của script chính
echo "Start running backend side"
(cd backend && npm run start:dev) &

echo "Start running frontend side"
(cd frontend && npm run dev) &

echo " All services are running smoothy"
wait





#!/bin/sh
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}==============================================="
echo -e	"==========${NC}STARTING REBUILD PROCESS${GREEN}============="
echo -e "===============================================${NC}"
echo -e ""

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

cp environment_data/api/.env.local api/.env.local

docker compose -f docker-compose.yaml -f docker-compose.local.yaml up --build -d
docker compose exec api composer install
docker compose exec api php bin/console cache:clear
echo -e "${GREEN}Clearing cache - done${NC}"
echo -e " "
docker compose exec api chmod -R 777 var/cache
echo -e "${GREEN}Permissions var/cache - done${NC}"
echo -e " "
docker compose exec api chmod -R 777 var/log
echo -e "${GREEN}Permissions var/log - done${NC}"
echo -e " "
echo -e "${GREEN}==============================================="
echo -e "==================${NC}FINISHED!${GREEN}===================="
echo -e "===============================================${NC}"

#!/bin/sh
docker-compose exec api php bin/console cache:clear
echo -e "Clearing cache - done"
echo -e " "
docker-compose exec api chmod -R 777 var/cache
echo -e "Add rewrite rules 777 to var/cache - done"
echo -e " "
docker-compose exec api chmod -R 777 var/log
echo -e "Add rewrite rules 777 to var/log - done"
echo -e " "
echo -e "Finished!"

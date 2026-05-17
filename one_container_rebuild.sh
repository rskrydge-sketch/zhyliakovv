#!/bin/sh
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e ""
echo -e "${GREEN}=======${NC}CHECKING ARGUMENTS FOR REBUILD${GREEN}==========${NC}"
echo -e ""
echo -e ""

 while test $# -gt 0; do
         case "$1" in
              -container)
                  shift
                  container=$1
                  shift
                  ;;
              -environment)
                  shift
                  environment=$1
                  shift
                  ;;
              *)
                  echo "${RED}Please add all flags (-environment _value_ -container _value_) to shell script!${NC}"
                  return 1;
                  ;;
        esac
done


if test -z "$container"; then
      echo -e "${RED}Argument CONTAINER passed, start script with argument (-container)${NC}"

elif test -z "$environment"; then
      echo -e "${RED}Argument ENVIRONMENT passed, start script with argument (-environment)${NC}"

else
      echo -e "${GREEN}===============================================${NC}"
      echo -e "${GREEN}===============================================${NC}"
      echo -e "${RED}Rebuild started for CONTAINER :${NC} $container";
      echo -e "${RED}And for ENVIRONMENT :${NC} $environment";
      echo -e "${GREEN}===============================================${NC}"
      echo -e "${GREEN}===============================================${NC}"

      docker-compose -f docker-compose.yaml -f docker-compose.$environment.yaml stop -t 1 $container
      docker-compose -f docker-compose.yaml -f docker-compose.$environment.yaml build $container
      docker-compose -f docker-compose.yaml -f docker-compose.$environment.yaml create $container
      docker-compose -f docker-compose.yaml -f docker-compose.$environment.yaml start $container

      echo -e "${GREEN}==============================================="
      echo -e "==================${NC}FINISHED!${GREEN}==================="
      echo -e "===============================================${NC}"
      echo -e ""
fi

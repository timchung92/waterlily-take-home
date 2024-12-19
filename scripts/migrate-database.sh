#==============================
echo "running db migration script"
#==============================


#
# Check for WALPAPP_DB_PASSWORD
#
if [[ "$WALPAPP_DB_PASSWORD" == "" ]]; then
    echo "WALPAPP_DB_PASSWORD not set, failed to execute script database-schema.sql"
    exit 1    
fi

#
# Check for WALPAPP_DB_READ_WRITE_HOST
#
if [[ "$WALPAPP_DB_READ_WRITE_HOST" == "" ]]; then
    echo "WALPAPP_DB_READ_WRITE_HOST not set, failed to execute script database-schema.sql"
    exit 1    
fi

export PGPASSWORD=$WALPAPP_DB_PASSWORD


psql \
  -h $WALPAPP_DB_READ_WRITE_HOST \
  -U walpdbadmin walpdbadmin \
	-f packages/database/database-schema.sql

if [ $? -ne 0 ]; then
    echo "Failed to execute script database-schema.sql"
    exit 1
fi
#==============================
echo "successfully ran db migration script"
#==============================
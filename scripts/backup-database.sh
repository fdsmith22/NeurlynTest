#!/bin/bash

# Neurlyn Database Backup Script
# Run this script daily via cron for automated backups

# Configuration
BACKUP_DIR="/home/freddy/Neurlyn/backups"
DB_NAME="neurlyn"
MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/neurlyn"}
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Neurlyn Database Backup${NC}"
echo -e "${GREEN}========================================${NC}"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Create dated backup folder
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

echo -e "${YELLOW}Starting backup at $(date)${NC}"

# Perform MongoDB dump
echo "Backing up database: $DB_NAME"
mongodump --uri="$MONGO_URI" --out="$BACKUP_PATH" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database backup successful${NC}"

    # Compress the backup
    echo "Compressing backup..."
    tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Compression successful${NC}"

        # Remove uncompressed backup
        rm -rf "$BACKUP_PATH"

        # Calculate backup size
        BACKUP_SIZE=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
        echo -e "${GREEN}Backup size: $BACKUP_SIZE${NC}"
    else
        echo -e "${RED}✗ Compression failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Database backup failed${NC}"
    exit 1
fi

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | wc -l)
echo -e "${GREEN}Total backups retained: $BACKUP_COUNT${NC}"

# Create latest symlink
ln -sf "$BACKUP_PATH.tar.gz" "$BACKUP_DIR/latest.tar.gz"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed at $(date)${NC}"
echo -e "${GREEN}Backup location: $BACKUP_PATH.tar.gz${NC}"
echo -e "${GREEN}========================================${NC}"

# Optional: Send notification (uncomment and configure as needed)
# echo "Neurlyn backup completed: $BACKUP_PATH.tar.gz ($BACKUP_SIZE)" | mail -s "Neurlyn Backup Success" admin@yourdomain.com

# Optional: Upload to cloud storage (uncomment and configure as needed)
# aws s3 cp "$BACKUP_PATH.tar.gz" s3://your-backup-bucket/neurlyn/
# gsutil cp "$BACKUP_PATH.tar.gz" gs://your-backup-bucket/neurlyn/

exit 0
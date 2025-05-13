db = db.getSiblingDB('workers')

// Создаем коллекции
db.createCollection('accountants')
db.createCollection('cron-jobs')
db.createCollection('workers')
db.createCollection('workers-crm')

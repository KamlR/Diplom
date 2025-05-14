db = db.getSiblingDB('workers')

db.createCollection('accountants')
db.createCollection('cron-jobs')
db.createCollection('workers')
db.createCollection('workers-crm')

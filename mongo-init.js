// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Authenticate as admin user
db = db.getSiblingDB('admin');
db.auth('admin', 'admin');

// Switch to the plant-care database
db = db.getSiblingDB('plant-care');

// Create a user for the application
db.createUser({
  user: 'plantcare_user',
  pwd: 'plantcare_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'plant-care'
    }
  ]
});

// Create collections
db.createCollection('plants');
db.createCollection('schedules');

print('MongoDB initialization completed successfully!');
print('Database: plant-care');
print('User: plantcare_user');
print('Collections: plants, schedules'); 
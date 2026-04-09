const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
  // Production
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Local development fallback 
  sequelize = new Sequelize(
    process.env.DB_NAME || 'aetherlink_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: console.log
    }
  );
}

sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully');
  })
  .catch(err => {
    console.error('❌ Error connecting to DB:', err.message);
    if (err.parent) console.error('Parent error:', err.parent.message);
  });

module.exports = sequelize;
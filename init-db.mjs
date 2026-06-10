import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

async function setupDatabase() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ ERROR: POSTGRES_URL is missing in your .env.local file.');
    console.log('Please grab a free connection string from Supabase or Neon, paste it into .env.local, and try again!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }, // required for cloud databases
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Postgres database!');

    console.log('Creating chat_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          sender TEXT NOT NULL CHECK (sender IN ('user', 'sweetu')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating device_aliases table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_aliases (
          id SERIAL PRIMARY KEY,
          alias_name TEXT NOT NULL,
          device_type TEXT NOT NULL,
          ha_entity_id TEXT
      );
    `);

    console.log('Adding example aliases...');
    // We use ON CONFLICT to avoid duplicate errors if the script is run multiple times
    await client.query(`
      INSERT INTO device_aliases (alias_name, device_type, ha_entity_id) VALUES 
      ('Anime Wall', 'wled', 'light.wled_anime_wall'),
      ('Desk Glow', 'wled', 'light.wled_desk_glow'),
      ('Gaming Monitors', 'relay', 'switch.gaming_monitors')
      ON CONFLICT DO NOTHING;
    `).catch(e => {
        // Simple error catch if table doesn't have unique constraints yet
        console.log('Example aliases already exist or query skipped.');
    });

    console.log('🎉 Database setup complete! You can now start Sweetu OS.');
    client.release();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();

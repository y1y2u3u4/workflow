import pkg from 'pg';
const { Pool } = pkg;

let globalPool;
export const getDb = () => {
  if (!globalPool) {
    const POSTGRES_URL = "postgresql://postgres.hhejytvevukefsbykjrh:LTzFuL10npCShwcv@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    // globalPool = new Pool({ connectionString: process.env.POSTGRES_URL });
    globalPool = new Pool({ connectionString: POSTGRES_URL });
    console.log('Create new pool', POSTGRES_URL);
    globalPool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return globalPool;
}

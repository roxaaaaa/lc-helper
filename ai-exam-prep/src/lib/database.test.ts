import { getDb, initDb, closeDb } from './database'; // adjust path if needed

describe('Database Initialization', () => {
  beforeAll(async () => {
    // Ensure DB is initialized before running tests
    await initDb();
  });

  afterAll(async () => {
    // Close DB connections after tests
    await closeDb();
  });

  test('should connect to database', async () => {
    const client = await getDb();
    expect(client).toBeDefined();
    client.release();
  });

  test('should create users table', async () => {
    const client = await getDb();
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"
    );
    client.release();
    const columns = res.rows.map((r) => r.column_name);
    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'firstname',
        'lastname',
        'email',
        'password',
        'school',
        'year',
        'trialstartdate',
        'trialenddate',
        'subscriptionstatus',
        'subscriptiontype',
        'subscriptionenddate',
        'createdat'
      ])
    );
  });

  test('should create subscription_plans table with defaults', async () => {
    const client = await getDb();
    const res = await client.query('SELECT * FROM subscription_plans;');
    client.release();
    expect(res.rows.length).toBeGreaterThan(0);
    const planNames = res.rows.map((p) => p.name);
    expect(planNames).toEqual(expect.arrayContaining(['Monthly', 'Yearly']));
  });

  test('should create payment_history table', async () => {
    const client = await getDb();
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'payment_history';"
    );
    client.release();
    const columns = res.rows.map((r) => r.column_name);
    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'userid',
        'planid',
        'amount',
        'currency',
        'status',
        'paymentmethod',
        'transactionid',
        'createdat'
      ])
    );
  });
});


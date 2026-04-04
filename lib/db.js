const { Pool } = require('pg');

/**
 * Load environment variables from process.env.  Make sure to copy `.env.example`
 * to `.env` and adjust values accordingly when running locally or in
 * production.
 */
const connectionString = process.env.DATABASE_URL;

// Create a singleton pool so connections are reused across API routes.
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Insert a new survey response into the database.
 *
 * @param {Object} data The response payload containing all fields.
 * @returns {Promise<Object>} The inserted row.
 */
async function saveResponse(data) {
  const {
    respondent_type,
    location,
    op_negative_impact,
    op_service_time,
    op_working_hours,
    op_customer_flow,
    business_cost,
    business_sales,
    business_profit,
    emp_stress,
    emp_efficiency,
    emp_customer_handling,
    policy_necessary,
    policy_pressure,
    ip_hash,
  } = data;
  const query = `INSERT INTO responses (
    respondent_type, location,
    op_negative_impact, op_service_time, op_working_hours, op_customer_flow,
    business_cost, business_sales, business_profit,
    emp_stress, emp_efficiency, emp_customer_handling,
    policy_necessary, policy_pressure,
    ip_hash
  ) VALUES (
    $1, $2,
    $3, $4, $5, $6,
    $7, $8, $9,
    $10, $11, $12,
    $13, $14,
    $15
  ) RETURNING *;`;
  const values = [
    respondent_type,
    location,
    op_negative_impact,
    op_service_time,
    op_working_hours,
    op_customer_flow,
    business_cost,
    business_sales,
    business_profit,
    emp_stress,
    emp_efficiency,
    emp_customer_handling,
    policy_necessary,
    policy_pressure,
    ip_hash,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Fetch all survey responses from the database.
 *
 * @returns {Promise<Array>} Array of response objects.
 */
async function getAllResponses() {
  const { rows } = await pool.query('SELECT * FROM responses ORDER BY submitted_at DESC;');
  return rows;
}

module.exports = {
  pool,
  saveResponse,
  getAllResponses,
};
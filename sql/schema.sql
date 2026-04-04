-- Schema definition for the survey responses table

-- Enable pgcrypto for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    response_id UUID NOT NULL DEFAULT gen_random_uuid(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    respondent_type VARCHAR(20) NOT NULL,
    location VARCHAR(50) NOT NULL,

    -- General impact (Likert 1–5)
    op_negative_impact SMALLINT NOT NULL,
    op_service_time SMALLINT NOT NULL,
    op_working_hours SMALLINT NOT NULL,
    op_customer_flow SMALLINT NOT NULL,

    -- Business impact (Owners only)
    business_cost SMALLINT,
    business_sales SMALLINT,
    business_profit SMALLINT,

    -- Employee impact (Employees only)
    emp_stress SMALLINT,
    emp_efficiency SMALLINT,
    emp_customer_handling SMALLINT,

    -- Policy opinion
    policy_necessary SMALLINT NOT NULL,
    policy_pressure SMALLINT NOT NULL,

    ip_hash VARCHAR(64)
);

-- Index to help ensure a respondent does not submit multiple responses from the same IP hash
CREATE UNIQUE INDEX IF NOT EXISTS unique_ip_hash ON responses(ip_hash);
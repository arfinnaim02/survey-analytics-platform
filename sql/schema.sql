CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    response_id UUID NOT NULL DEFAULT gen_random_uuid(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    role VARCHAR(30) NOT NULL,
    supermarket_type VARCHAR(50) NOT NULL,
    location VARCHAR(50) NOT NULL,
    backup_power_source VARCHAR(50) NOT NULL,
    years_in_service VARCHAR(30) NOT NULL,

    iv_power_interruptions SMALLINT NOT NULL,
    iv_outage_duration SMALLINT NOT NULL,
    iv_unstable_electricity SMALLINT NOT NULL,
    iv_fuel_price_pressure SMALLINT NOT NULL,
    iv_tariff_pressure SMALLINT NOT NULL,
    iv_early_closure SMALLINT NOT NULL,
    iv_reduced_working_hours SMALLINT NOT NULL,
    iv_daily_uncertainty SMALLINT NOT NULL,
    iv_backup_dependence SMALLINT NOT NULL,
    iv_policy_flexibility SMALLINT NOT NULL,

    business_cost_increase_level VARCHAR(20),
    business_sales_decrease_level VARCHAR(20),
    business_cost_increase SMALLINT,
    business_sales_reduced_hours SMALLINT,
    business_profit_margin_decline SMALLINT,
    business_evening_customer_flow SMALLINT,
    business_inventory_difficulty SMALLINT,
    business_backup_maintenance_cost SMALLINT,

    employee_workload_change VARCHAR(20),
    employee_work_stress SMALLINT,
    employee_efficiency_decrease SMALLINT,
    employee_job_difficulty SMALLINT,
    employee_customer_handling SMALLINT,
    employee_uncomfortable_environment SMALLINT,
    employee_routine_disruption SMALLINT,
    employee_low_motivation SMALLINT,

    policy_necessary SMALLINT NOT NULL,
    policy_business_negative SMALLINT NOT NULL,
    policy_balance_needed SMALLINT NOT NULL,
    policy_preferred_solution VARCHAR(50) NOT NULL,

    ip_hash VARCHAR(64)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_ip_hash ON responses(ip_hash);
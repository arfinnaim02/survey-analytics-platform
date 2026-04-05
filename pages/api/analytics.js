import { getAllResponses } from '../../lib/db';
import cookie from 'cookie';
import {
  calculateMean,
  calculatePercentages,
  calculateCompositeScore,
  crossTabulate,
} from '../../lib/analytics';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const responses = await getAllResponses();
    const totalResponses = responses.length;

    const respondentCounts = responses.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {});

    const locationCounts = responses.reduce((acc, r) => {
      acc[r.location] = (acc[r.location] || 0) + 1;
      return acc;
    }, {});

    const supermarketTypeCounts = responses.reduce((acc, r) => {
      acc[r.supermarket_type] = (acc[r.supermarket_type] || 0) + 1;
      return acc;
    }, {});

    const backupPowerCounts = responses.reduce((acc, r) => {
      acc[r.backup_power_source] = (acc[r.backup_power_source] || 0) + 1;
      return acc;
    }, {});

    const yearsInServiceCounts = responses.reduce((acc, r) => {
      acc[r.years_in_service] = (acc[r.years_in_service] || 0) + 1;
      return acc;
    }, {});

    const policyPreferredSolutionCounts = responses.reduce((acc, r) => {
      acc[r.policy_preferred_solution] = (acc[r.policy_preferred_solution] || 0) + 1;
      return acc;
    }, {});

    const workloadChangeCounts = responses.reduce((acc, r) => {
      if (r.employee_workload_change) {
        acc[r.employee_workload_change] = (acc[r.employee_workload_change] || 0) + 1;
      }
      return acc;
    }, {});

    const costIncreaseLevelCounts = responses.reduce((acc, r) => {
      if (r.business_cost_increase_level) {
        acc[r.business_cost_increase_level] = (acc[r.business_cost_increase_level] || 0) + 1;
      }
      return acc;
    }, {});

    const salesDecreaseLevelCounts = responses.reduce((acc, r) => {
      if (r.business_sales_decrease_level) {
        acc[r.business_sales_decrease_level] = (acc[r.business_sales_decrease_level] || 0) + 1;
      }
      return acc;
    }, {});

    const independentFields = [
      'iv_power_interruptions',
      'iv_outage_duration',
      'iv_unstable_electricity',
      'iv_fuel_price_pressure',
      'iv_tariff_pressure',
      'iv_early_closure',
      'iv_reduced_working_hours',
      'iv_daily_uncertainty',
      'iv_backup_dependence',
      'iv_policy_flexibility',
    ];

    const independentStats = {};
    for (const field of independentFields) {
      independentStats[field] = {
        mean: calculateMean(responses, field),
        percentages: calculatePercentages(responses, field),
      };
    }

    const ownerManagers = responses.filter((r) => r.role === 'owner_manager');
    const floorEmployees = responses.filter((r) => r.role === 'floor_employee');

    const businessFields = [
      'business_cost_increase',
      'business_sales_reduced_hours',
      'business_profit_margin_decline',
      'business_evening_customer_flow',
      'business_inventory_difficulty',
      'business_backup_maintenance_cost',
    ];

    const businessStats = {};
    if (ownerManagers.length > 0) {
      for (const field of businessFields) {
        businessStats[field] = {
          mean: calculateMean(ownerManagers, field),
          percentages: calculatePercentages(ownerManagers, field),
        };
      }
    }

    const employeeFields = [
      'employee_work_stress',
      'employee_efficiency_decrease',
      'employee_job_difficulty',
      'employee_customer_handling',
      'employee_uncomfortable_environment',
      'employee_routine_disruption',
      'employee_low_motivation',
    ];

    const employeeStats = {};
    if (floorEmployees.length > 0) {
      for (const field of employeeFields) {
        employeeStats[field] = {
          mean: calculateMean(floorEmployees, field),
          percentages: calculatePercentages(floorEmployees, field),
        };
      }
    }

    const policyFields = [
      'policy_necessary',
      'policy_business_negative',
      'policy_balance_needed',
    ];

    const policyStats = {};
    for (const field of policyFields) {
      policyStats[field] = {
        mean: calculateMean(responses, field),
        percentages: calculatePercentages(responses, field),
      };
    }

    const businessImpactScore = ownerManagers.length
      ? calculateCompositeScore(ownerManagers, businessFields)
      : 0;

    const employeeImpactScore = floorEmployees.length
      ? calculateCompositeScore(floorEmployees, employeeFields)
      : 0;

    const typeVsPolicy = crossTabulate(responses, 'role', 'policy_business_negative');
    const typeVsBalance = crossTabulate(responses, 'role', 'policy_balance_needed');
    const locationVsImpact = crossTabulate(responses, 'location', 'iv_power_interruptions');

    return res.status(200).json({
      totalResponses,
      respondentCounts,
      locationCounts,
      supermarketTypeCounts,
      backupPowerCounts,
      yearsInServiceCounts,
      policyPreferredSolutionCounts,
      workloadChangeCounts,
      costIncreaseLevelCounts,
      salesDecreaseLevelCounts,
      independentStats,
      businessStats,
      employeeStats,
      policyStats,
      businessImpactScore,
      employeeImpactScore,
      typeVsPolicy,
      typeVsBalance,
      locationVsImpact,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to compute analytics' });
  }
}
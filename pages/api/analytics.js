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

    // Group counts
    const respondentCounts = responses.reduce((acc, r) => {
      const type = r.respondent_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const locationCounts = responses.reduce((acc, r) => {
      const loc = r.location;
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});

    // Means and distributions for general impact
    const generalQuestions = {
      op_negative_impact: 'negativeImpact',
      op_service_time: 'serviceTime',
      op_working_hours: 'workingHours',
      op_customer_flow: 'customerFlow',
    };
    const generalStats = {};
    for (const field of Object.keys(generalQuestions)) {
      generalStats[field] = {
        mean: calculateMean(responses, field),
        percentages: calculatePercentages(responses, field),
      };
    }

    // Business impact: filter owners
    const owners = responses.filter(r => r.respondent_type === 'owner');
    const businessFields = ['business_cost', 'business_sales', 'business_profit'];
    const businessStats = {};
    if (owners.length > 0) {
      for (const field of businessFields) {
        businessStats[field] = {
          mean: calculateMean(owners, field),
          percentages: calculatePercentages(owners, field),
        };
      }
    }

    // Employee impact
    const employees = responses.filter(r => r.respondent_type === 'employee');
    const employeeFields = ['emp_stress', 'emp_efficiency', 'emp_customer_handling'];
    const employeeStats = {};
    if (employees.length > 0) {
      for (const field of employeeFields) {
        employeeStats[field] = {
          mean: calculateMean(employees, field),
          percentages: calculatePercentages(employees, field),
        };
      }
    }

    // Policy opinions (all respondents)
    const policyFields = ['policy_necessary', 'policy_pressure'];
    const policyStats = {};
    for (const field of policyFields) {
      policyStats[field] = {
        mean: calculateMean(responses, field),
        percentages: calculatePercentages(responses, field),
      };
    }

    // Composite scores
    const businessImpactScore = owners.length ? calculateCompositeScore(owners, businessFields) : 0;
    const employeeImpactScore = employees.length ? calculateCompositeScore(employees, employeeFields) : 0;

    // Cross tabs
    const typeVsPolicy = crossTabulate(responses, 'respondent_type', 'policy_pressure');
    const locationVsImpact = crossTabulate(responses, 'location', 'op_negative_impact');

    return res.status(200).json({
      totalResponses,
      respondentCounts,
      locationCounts,
      generalStats,
      businessStats,
      employeeStats,
      policyStats,
      businessImpactScore,
      employeeImpactScore,
      typeVsPolicy,
      locationVsImpact,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to compute analytics' });
  }
}
import { getAllResponses } from '../../lib/db';
import cookie from 'cookie';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

function formatLabel(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLikert(value) {
  const map = {
    1: 'Strongly Agree',
    2: 'Agree',
    3: 'Neutral',
    4: 'Disagree',
    5: 'Strongly Disagree',
  };
  return map[Number(value)] || value || '';
}

function calcMean(rows, field) {
  const nums = rows
    .map((r) => Number(r[field]))
    .filter((n) => Number.isFinite(n));

  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] ?? 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

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
    const format = (req.query.format || 'csv').toLowerCase();

    if (!responses.length) {
      return res.status(200).send('No data available');
    }

    const headers = [
      'ID',
      'Response ID',
      'Submitted At',
      'Reviewed Status',

      'What is your role in the market?',
      'What type of market is this?',
      'Where is the market located?',
      'What is the main backup power source?',
      'How long have you worked in this sector?',

      'Power cuts affect daily operations.',
      'Power outages last too long.',
      'Unstable electricity affects business continuity.',
      'Fuel and oil prices increase pressure.',
      'Higher electricity tariffs are difficult to manage.',
      'Early closing reduces profitable hours.',
      'Reduced hours limit customer flow.',
      'Energy problems create planning uncertainty.',
      'The market depends more on backup power.',
      'Energy policies reduce business flexibility.',

      'How much have costs increased?',
      'How much have sales decreased?',
      'Operational costs have increased.',
      'Daily sales have decreased.',
      'Profit margins have declined.',
      'Evening customer flow has decreased.',
      'Inventory management has become difficult.',
      'Backup maintenance costs have increased.',

      'How has your workload changed?',
      'My work stress has increased.',
      'My work efficiency has decreased.',
      'Power-related issues make my job harder.',
      'Customer handling becomes more difficult.',
      'The work environment becomes uncomfortable.',
      'My daily work routine is disrupted.',
      'I feel less motivated to work.',

      'Energy-saving policies are necessary.',
      'Current policies hurt business performance.',
      'A balance between energy saving and business activity is needed.',
      'Which policy solution do you prefer?',

      'IP Hash',
    ];

    const rows = responses.map((r) => [
      r.id,
      r.response_id,
      new Date(r.submitted_at).toLocaleString(),
      r.is_reviewed ? 'Reviewed' : 'Pending',

      formatLabel(r.role),
      formatLabel(r.supermarket_type),
      formatLabel(r.location),
      formatLabel(r.backup_power_source),
      formatLabel(r.years_in_service),

      formatLikert(r.iv_power_interruptions),
      formatLikert(r.iv_outage_duration),
      formatLikert(r.iv_unstable_electricity),
      formatLikert(r.iv_fuel_price_pressure),
      formatLikert(r.iv_tariff_pressure),
      formatLikert(r.iv_early_closure),
      formatLikert(r.iv_reduced_working_hours),
      formatLikert(r.iv_daily_uncertainty),
      formatLikert(r.iv_backup_dependence),
      formatLikert(r.iv_policy_flexibility),

      formatLabel(r.business_cost_increase_level),
      formatLabel(r.business_sales_decrease_level),
      formatLikert(r.business_cost_increase),
      formatLikert(r.business_sales_reduced_hours),
      formatLikert(r.business_profit_margin_decline),
      formatLikert(r.business_evening_customer_flow),
      formatLikert(r.business_inventory_difficulty),
      formatLikert(r.business_backup_maintenance_cost),

      formatLabel(r.employee_workload_change),
      formatLikert(r.employee_work_stress),
      formatLikert(r.employee_efficiency_decrease),
      formatLikert(r.employee_job_difficulty),
      formatLikert(r.employee_customer_handling),
      formatLikert(r.employee_uncomfortable_environment),
      formatLikert(r.employee_routine_disruption),
      formatLikert(r.employee_low_motivation),

      formatLikert(r.policy_necessary),
      formatLikert(r.policy_business_negative),
      formatLikert(r.policy_balance_needed),
      formatLabel(r.policy_preferred_solution),

      r.ip_hash || '',
    ]);

    if (format === 'csv') {
      const csvRows = [
        headers.map((h) => JSON.stringify(h)).join(','),
        ...rows.map((row) => row.map((v) => JSON.stringify(v ?? '')).join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="responses_full_questions.csv"');
      return res.status(200).send(csvRows.join('\n'));
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Responses');

      sheet.addRow(headers);
      rows.forEach((row) => sheet.addRow(row));

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      sheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.min(Math.max(header.length / 1.5, 18), 42),
      }));

      sheet.eachRow((row, rowNumber) => {
        row.alignment = {
          vertical: 'middle',
          horizontal: rowNumber === 1 ? 'center' : 'left',
          wrapText: true,
        };
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="responses_full_questions.xlsx"'
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const ownerManagers = responses.filter((r) => r.role === 'owner_manager');
      const floorEmployees = responses.filter((r) => r.role === 'floor_employee');

      const roleCounts = countBy(responses, 'role');
      const locationCounts = countBy(responses, 'location');
      const solutionCounts = countBy(responses, 'policy_preferred_solution');

      const businessImpactScore = ownerManagers.length
        ? [
            calcMean(ownerManagers, 'business_cost_increase'),
            calcMean(ownerManagers, 'business_sales_reduced_hours'),
            calcMean(ownerManagers, 'business_profit_margin_decline'),
            calcMean(ownerManagers, 'business_evening_customer_flow'),
            calcMean(ownerManagers, 'business_inventory_difficulty'),
            calcMean(ownerManagers, 'business_backup_maintenance_cost'),
          ].reduce((a, b) => a + b, 0) / 6
        : 0;

      const employeeImpactScore = floorEmployees.length
        ? [
            calcMean(floorEmployees, 'employee_work_stress'),
            calcMean(floorEmployees, 'employee_efficiency_decrease'),
            calcMean(floorEmployees, 'employee_job_difficulty'),
            calcMean(floorEmployees, 'employee_customer_handling'),
            calcMean(floorEmployees, 'employee_uncomfortable_environment'),
            calcMean(floorEmployees, 'employee_routine_disruption'),
            calcMean(floorEmployees, 'employee_low_motivation'),
          ].reduce((a, b) => a + b, 0) / 7
        : 0;

      const policyNecessary = calcMean(responses, 'policy_necessary');
      const policyNegative = calcMean(responses, 'policy_business_negative');
      const policyBalance = calcMean(responses, 'policy_balance_needed');

      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="premium-report.pdf"');

      doc.pipe(res);

      doc.fontSize(20).fillColor('#0f172a').text(
        'Impact of the Energy Crisis on Supermarket Employees and Shop Owners in Bangladesh',
        { align: 'center' }
      );

      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#64748b').text(
        'Auto-generated policy research summary report',
        { align: 'center' }
      );

      doc.moveDown(1.5);

      doc.fontSize(14).fillColor('#0f172a').text('Executive Summary');
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#334155');

      let summaryText = `A total of ${responses.length} responses were collected. `;
      if (businessImpactScore > employeeImpactScore) {
        summaryText += `Business-side effects appear stronger overall, with a business impact score of ${businessImpactScore.toFixed(2)} compared with an employee impact score of ${employeeImpactScore.toFixed(2)}. `;
      } else if (employeeImpactScore > businessImpactScore) {
        summaryText += `Employee-side disruption appears stronger overall, with an employee impact score of ${employeeImpactScore.toFixed(2)} compared with a business impact score of ${businessImpactScore.toFixed(2)}. `;
      } else {
        summaryText += `Business-side and employee-side impacts appear broadly comparable. `;
      }
      summaryText += `Policy necessity averaged ${policyNecessary.toFixed(2)}, policy negativity averaged ${policyNegative.toFixed(2)}, and support for a balanced approach averaged ${policyBalance.toFixed(2)}.`;

      doc.text(summaryText, {
        align: 'justify',
        lineGap: 4,
      });

      doc.moveDown(1.2);
      doc.fontSize(14).fillColor('#0f172a').text('Key Indicators');
      doc.moveDown(0.5);

      const indicators = [
        ['Total Responses', String(responses.length)],
        ['Owner / Manager Responses', String(roleCounts.owner_manager || 0)],
        ['Floor Employee Responses', String(roleCounts.floor_employee || 0)],
        ['Business Impact Score', businessImpactScore.toFixed(2)],
        ['Employee Impact Score', employeeImpactScore.toFixed(2)],
        ['Policy Necessary Mean', policyNecessary.toFixed(2)],
        ['Policy Negative Mean', policyNegative.toFixed(2)],
        ['Balance Needed Mean', policyBalance.toFixed(2)],
      ];

      indicators.forEach(([label, value]) => {
        doc.fontSize(10).fillColor('#0f172a').text(`${label}: `, { continued: true });
        doc.font('Helvetica-Bold').text(value);
        doc.font('Helvetica');
      });

      doc.moveDown(1.2);
      doc.fontSize(14).fillColor('#0f172a').text('Profile Snapshot');
      doc.moveDown(0.5);

      Object.entries(locationCounts).forEach(([key, val]) => {
        doc.fontSize(10).fillColor('#334155').text(`${formatLabel(key)}: ${val}`);
      });

      doc.moveDown(0.8);
      doc.fontSize(14).fillColor('#0f172a').text('Preferred Policy Solutions');
      doc.moveDown(0.5);

      Object.entries(solutionCounts).forEach(([key, val]) => {
        doc.fontSize(10).fillColor('#334155').text(`${formatLabel(key)}: ${val}`);
      });

      doc.moveDown(1.2);
      doc.fontSize(14).fillColor('#0f172a').text('Auto Findings');
      doc.moveDown(0.4);

      const findings = [
        businessImpactScore >= 3.5
          ? `Business-side responses indicate a high level of perceived impact (${businessImpactScore.toFixed(2)}).`
          : `Business-side responses indicate a moderate level of perceived impact (${businessImpactScore.toFixed(2)}).`,
        employeeImpactScore >= 3.5
          ? `Employee responses indicate strong disruption in work conditions (${employeeImpactScore.toFixed(2)}).`
          : `Employee responses indicate visible but more moderate workforce disruption (${employeeImpactScore.toFixed(2)}).`,
        policyNegative > policyNecessary
          ? `Respondents view current policies as more harmful to business than necessary.`
          : `Respondents still recognize the necessity of current energy-saving policies.`,
        `Support for a balanced approach between energy saving and economic activity remains strong (${policyBalance.toFixed(2)}).`,
      ];

      findings.forEach((item, index) => {
        doc.fontSize(10).fillColor('#334155').text(`${index + 1}. ${item}`, {
          align: 'justify',
          lineGap: 3,
        });
        doc.moveDown(0.3);
      });

      doc.moveDown(1);
      doc.fontSize(13).fillColor('#0f172a').text('Response Table Preview');
      doc.moveDown(0.4);

      const previewHeaders = ['ID', 'Role', 'Location', 'Market Type', 'Submitted'];
      const previewRows = responses.slice(0, 10).map((r) => [
        String(r.id),
        formatLabel(r.role),
        formatLabel(r.location),
        formatLabel(r.supermarket_type),
        new Date(r.submitted_at).toLocaleDateString(),
      ]);

      const startX = doc.x;
      const colWidths = [40, 120, 130, 150, 90];

      function drawRow(row, isHeader = false) {
        let x = startX;
        const y = doc.y;

        row.forEach((cell, i) => {
          doc
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor(isHeader ? '#0f172a' : '#334155')
            .text(String(cell), x, y, {
              width: colWidths[i],
              continued: false,
            });
          x += colWidths[i];
        });

        doc.moveDown(1.2);
      }

      drawRow(previewHeaders, true);
      previewRows.forEach((row) => drawRow(row, false));

      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Invalid format' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Export failed' });
  }
}
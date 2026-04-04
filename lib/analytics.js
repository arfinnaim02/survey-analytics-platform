/**
 * Compute the mean of a numeric field across an array of responses.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string} field Name of the field to average.
 * @returns {number} The arithmetic mean or 0 if no data.
 */
function calculateMean(data, field) {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
  return sum / data.length;
}

/**
 * Compute the standard deviation of a numeric field.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string} field Name of the field.
 * @returns {number} Standard deviation.
 */
function calculateStandardDeviation(data, field) {
  const mean = calculateMean(data, field);
  const variance = data.reduce((acc, item) => {
    const val = Number(item[field]) || 0;
    return acc + Math.pow(val - mean, 2);
  }, 0) / (data.length || 1);
  return Math.sqrt(variance);
}

/**
 * Compute distribution (frequency) of responses for a field.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string} field Name of the field.
 * @returns {Object} Mapping from value to count.
 */
function calculateDistribution(data, field) {
  return data.reduce((acc, item) => {
    const val = item[field];
    if (val != null) {
      acc[val] = (acc[val] || 0) + 1;
    }
    return acc;
  }, {});
}

/**
 * Compute the percentage of responses for each value (1–5) in a field.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string} field Name of the field.
 * @returns {Object} Mapping from value to percentage (0–100).
 */
function calculatePercentages(data, field) {
  const dist = calculateDistribution(data, field);
  const total = data.length || 1;
  const percentages = {};
  for (const key of Object.keys(dist)) {
    percentages[key] = (dist[key] / total) * 100;
  }
  return percentages;
}

/**
 * Compute a composite score as the mean of multiple fields.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string[]} fields Fields to include in the composite.
 * @returns {number} Composite score.
 */
function calculateCompositeScore(data, fields) {
  if (!data || data.length === 0) return 0;
  const total = data.reduce((acc, item) => {
    const sumFields = fields.reduce((s, field) => s + (Number(item[field]) || 0), 0);
    return acc + sumFields / fields.length;
  }, 0);
  return total / data.length;
}

/**
 * Create a cross‑tabulation between two categorical fields.
 *
 * @param {Array<Object>} data Array of response objects.
 * @param {string} fieldX First field (rows).
 * @param {string} fieldY Second field (columns).
 * @returns {Object} A nested object where keys of fieldX map to objects of fieldY counts.
 */
function crossTabulate(data, fieldX, fieldY) {
  const result = {};
  data.forEach(item => {
    const x = item[fieldX];
    const y = item[fieldY];
    if (x != null && y != null) {
      if (!result[x]) result[x] = {};
      result[x][y] = (result[x][y] || 0) + 1;
    }
  });
  return result;
}

module.exports = {
  calculateMean,
  calculateStandardDeviation,
  calculateDistribution,
  calculatePercentages,
  calculateCompositeScore,
  crossTabulate,
};
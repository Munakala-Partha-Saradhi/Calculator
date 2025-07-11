// Core calculation logic for Jest tests
// This function should match the calculator's behavior and error handling

function calculate(expression) {
  if (!expression || typeof expression !== 'string' || expression.trim() === '') {
    return 'Error: Invalid input';
  }

  // Prevent invalid characters
  if (/[^0-9+\-*/().eE^\sMathsqrt]/.test(expression)) {
    return 'Error: Invalid input';
  }

  // Replace custom operators for compatibility
  let expr = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**');

  // Handle square root
  if (/Math\.sqrt\(-?\d+\)/.test(expr)) {
    const match = expr.match(/Math\.sqrt\((-?\d+)\)/);
    if (match && Number(match[1]) < 0) {
      return 'Error: Invalid input';
    }
  }

  try {
    // Division by zero check
    if (/\/0(?![.\d])/.test(expr)) {
      return 'Error: Division by zero';
    }

    // Evaluate
    let result = eval(expr);

    // Handle overflow
    if (!isFinite(result)) {
      return 'Error: Overflow';
    }

    // Floating point rounding for addition
    if (/\d+\.\d+\s*[+\-*/]/.test(expr)) {
      result = Math.round(result * 1e10) / 1e10;
    }

    // Remove trailing zeros for floats
    if (typeof result === 'number') {
      if (Math.abs(result % 1) > 0) {
        result = parseFloat(result.toFixed(10)).toString();
      } else {
        result = result.toString();
      }
    }

    return result;
  } catch (e) {
    return 'Error: Invalid input';
  }
}

module.exports = { calculate };

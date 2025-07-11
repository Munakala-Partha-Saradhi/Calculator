// Jest test suite for calculator logic based on report.txt
// You may need to refactor your calculator logic into functions for direct testing

const { calculate } = require('./calculatorLogic'); // You should create this file to export calculation logic

describe('Calculator Functional Tests', () => {
  // Functional Requirements
  test('TC001: Basic Addition', () => {
    expect(calculate('5+3')).toBe('8');
  });
  test('TC002: Basic Subtraction', () => {
    expect(calculate('10-4')).toBe('6');
  });
  test('TC003: Basic Multiplication', () => {
    expect(calculate('7*6')).toBe('42');
  });
  test('TC004: Basic Division', () => {
    expect(calculate('15/3')).toBe('5');
  });
  test('TC005: Division by Zero', () => {
    expect(calculate('10/0')).toBe('Error: Division by zero');
  });
  test('TC006: Square Root Positive', () => {
    expect(calculate('Math.sqrt(25)')).toBe('5');
  });
  test('TC007: Square Root Negative', () => {
    expect(calculate('Math.sqrt(-16)')).toBe('Error: Invalid input');
  });
  test('TC008: Basic Exponentiation', () => {
    expect(calculate('2**3')).toBe('8');
  });
  test('TC009: Floating Point Addition', () => {
    expect(calculate('3.14+2.86')).toBe('6');
  });
  test('TC010: Very Large Numbers', () => {
    expect(calculate('999999999*999999999')).toMatch(/^(Error: Overflow|[\deE.+-]+)$/);
  });
  test('TC011: Invalid Character Input', () => {
    expect(calculate('abc+5')).toBe('Error: Invalid input');
  });
  test('TC012: Empty Input Field', () => {
    expect(calculate('')).toBe('Error: Invalid input');
  });
  test('TC013: Zero Operations', () => {
    expect(calculate('0+0')).toBe('0');
  });
  test('TC014: Negative Numbers', () => {
    expect(calculate('-5+3')).toBe('-2');
  });
  test('TC015: Fractional Exponents', () => {
    expect(calculate('8**(1/3)')).toBe('2');
  });

  // Additional edge cases and recommendations from report
  test('Order of Operations: PEMDAS', () => {
    expect(calculate('2+3*4')).toBe('14'); // Should follow PEMDAS
  });
  test('Complex Expression', () => {
    expect(calculate('2+3*4-5/2')).toBe('11.5');
  });
  test('Parentheses Precedence', () => {
    expect(calculate('(2+3)*4')).toBe('20');
  });
  test('Negative Parentheses', () => {
    expect(calculate('-(2+3)*4')).toBe('-20');
  });
  test('Large Exponent Overflow', () => {
    expect(calculate('1e308*1e10')).toBe('Error: Overflow');
  });
  test('Performance: Simple operation is fast', () => {
    const start = Date.now();
    calculate('1+1');
    const end = Date.now();
    expect(end - start).toBeLessThan(100);
  });
  test('Usability: Clear error for invalid input', () => {
    expect(calculate('2++2')).toBe('Error: Invalid input');
  });
});

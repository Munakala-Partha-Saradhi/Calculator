let currentInput = "0";
let expression = "";
let waitingForOperand = false;
let openParentheses = 0;
let isError = false;

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

function formatNumber(num) {
  if (num === "Error") return num;

  const number = parseFloat(num);
  if (isNaN(number)) return "0";

  if (
    Math.abs(number) > 999999999 ||
    (Math.abs(number) < 0.000001 && number !== 0)
  ) {
    return number.toExponential(6);
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 8,
    useGrouping: true,
  });
}

function updateDisplay() {
  if (isError) {
    resultDisplay.textContent = currentInput;
    resultDisplay.classList.add("error");
  } else {
    resultDisplay.textContent = formatNumber(currentInput);
    resultDisplay.classList.remove("error");
  }

  let displayExpression = expression;
  if (openParentheses > 0) {
    displayExpression +=
      '<span class="open-parentheses">' +
      "(".repeat(openParentheses) +
      "</span>";
  }
  expressionDisplay.innerHTML = displayExpression;
}

function inputNumber(num) {
  if (waitingForOperand || currentInput === "0") {
    currentInput = num;
    waitingForOperand = false;
  } else {
    currentInput = currentInput + num;
  }
  updateDisplay();
}

function inputDecimal() {
  if (waitingForOperand) {
    currentInput = "0.";
    waitingForOperand = false;
  } else if (currentInput.indexOf(".") === -1) {
    currentInput = currentInput + ".";
  }
  updateDisplay();
}

function addToExpression(value) {
  expression += value;
  waitingForOperand = true;
}

function inputOperator(op) {
  if (currentInput !== "0" && !waitingForOperand) {
    addToExpression(currentInput);
  }
  addToExpression(" " + op + " ");
  currentInput = "0";
  updateDisplay();
}

function inputOpenParenthesis() {
  if (currentInput !== "0" && !waitingForOperand) {
    addToExpression(currentInput);
    addToExpression(" × ");
  }
  addToExpression("(");
  openParentheses++;
  currentInput = "0";
  waitingForOperand = true;
  updateDisplay();
}

function inputCloseParenthesis() {
  if (openParentheses > 0) {
    if (currentInput !== "0") {
      addToExpression(currentInput);
    }
    addToExpression(")");
    openParentheses--;
    currentInput = "0";
    waitingForOperand = true;
    updateDisplay();
  }
}

function inputSquareRoot() {
  const value = parseFloat(currentInput);
  if (value < 0) {
    showError("Cannot calculate square root of negative number");
    return;
  }
  const result = Math.sqrt(value);
  currentInput = String(result);
  updateDisplay();
}

function inputExponent() {
  if (currentInput !== "0" && !waitingForOperand) {
    addToExpression(currentInput);
  }
  addToExpression(" ^ ");
  currentInput = "0";
  updateDisplay();
}

function evaluateExpression(expr) {
  try {
    let jsExpression = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**");

    jsExpression = jsExpression.replace(/√$$([^)]+)$$/g, (match, content) => {
      const value = evaluateExpression(content);
      if (value < 0) throw new Error("Square root of negative number");
      return String(Math.sqrt(value));
    });

    if (jsExpression.includes("/0") || jsExpression.includes("/ 0")) {
      throw new Error("Division by zero");
    }

    const result = Function('"use strict"; return (' + jsExpression + ")")();

    if (!isFinite(result)) {
      throw new Error("Result is infinite or undefined");
    }

    return result;
  } catch (error) {
    throw new Error("Invalid expression");
  }
}

function calculate() {
  try {
    let fullExpression = expression;
    if (currentInput !== "0") {
      fullExpression += currentInput;
    }

    // Close any remaining open parentheses
    fullExpression += ")".repeat(openParentheses);

    if (!fullExpression.trim()) {
      return;
    }

    const result = evaluateExpression(fullExpression);
    currentInput = String(result);
    expression = "";
    openParentheses = 0;
    waitingForOperand = true;
    updateDisplay();
  } catch (error) {
    showError(error.message || "Calculation error");
  }
}

function clearAll() {
  currentInput = "0";
  expression = "";
  openParentheses = 0;
  waitingForOperand = false;
  isError = false;
  updateDisplay();
}

function toggleSign() {
  if (currentInput !== "0") {
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }
}

function percentage() {
  const value = parseFloat(currentInput);
  if (!isNaN(value)) {
    currentInput = String(value / 100);
    updateDisplay();
  }
}

function showError(message = "Error") {
  currentInput = message;
  isError = true;
  updateDisplay();

  setTimeout(() => {
    isError = false;
    clearAll();
  }, 2000);
}

function toggleTheme() {
  const body = document.body;
  const calculator = document.querySelector(".calculator");
  const themeToggle = document.querySelector(".theme-toggle");

  if (body.classList.contains("light")) {
    body.classList.remove("light");
    body.classList.add("dark");
    calculator.classList.remove("light");
    calculator.classList.add("dark");
    themeToggle.classList.remove("light");
    themeToggle.classList.add("dark");
  } else {
    body.classList.remove("dark");
    body.classList.add("light");
    calculator.classList.remove("dark");
    calculator.classList.add("light");
    themeToggle.classList.remove("dark");
    themeToggle.classList.add("light");
  }
}

document.addEventListener("keydown", function (event) {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+") {
    inputOperator("+");
  } else if (key === "-") {
    inputOperator("-");
  } else if (key === "*") {
    inputOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    inputOperator("÷");
  } else if (key === "^") {
    inputExponent();
  } else if (key === "(") {
    inputOpenParenthesis();
  } else if (key === ")") {
    inputCloseParenthesis();
  } else if (key === "Enter" || key === "=") {
    calculate();
  } else if (key === "Escape" || key === "c" || key === "C") {
    clearAll();
  } else if (key === "%") {
    percentage();
  }
  else if(key=== "Backspace") {
    if (currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = "0";
    }
    updateDisplay();
  }
});
updateDisplay();

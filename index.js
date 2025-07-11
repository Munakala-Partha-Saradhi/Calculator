let currentInput = "0";
let expression = ""; // This variable will now primarily reflect the programmatic build
let waitingForOperand = false;
let openParentheses = 0; // This variable will track parentheses from programmatic input
let isError = false;

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

// Set expression display to be editable
expressionDisplay.contentEditable = "true";

// Listen for manual input in the expression display
expressionDisplay.addEventListener('input', () => {
    // When user manually edits, clear error state if present
    if (isError) {
        isError = false;
        resultDisplay.classList.remove("error");
    }
    // No need to update 'expression' variable here, 'calculate' will read directly from DOM
    // No need to call updateDisplay() here to avoid overwriting user input
});

function formatNumber(num) {
    if (num === "Error") return num;

    const number = parseFloat(num);
    if (isNaN(number)) return "0";

    if (
        Math.abs(number) > 999999999999 ||
        (Math.abs(number) < 0.000000001 && number !== 0)
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

    // Only update expressionDisplay from internal 'expression' variable
    // if it's not currently focused (being manually edited)
    if (document.activeElement !== expressionDisplay) {
        let displayExpression = expression;
        if (openParentheses > 0) {
            displayExpression += '<span class="open-parentheses">' + "(".repeat(openParentheses) + "</span>";
        }
        expressionDisplay.innerHTML = displayExpression;
    }
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

        // Handle square root function calls like √(value)
        jsExpression = jsExpression.replace(/√\(([^)]+)\)/g, (match, content) => {
            const value = evaluateExpression(content); // Recursively evaluate content inside sqrt
            if (value < 0) throw new Error("Square root of negative number");
            return String(Math.sqrt(value));
        });
        // Handle square root without explicit parentheses if it's the last operation
        jsExpression = jsExpression.replace(/√(\d+(\.\d+)?)$/, (match, content) => {
            const value = parseFloat(content);
            if (value < 0) throw new Error("Square root of negative number");
            return String(Math.sqrt(value));
        });


        if (jsExpression.includes("/0") || jsExpression.includes("/ 0") || jsExpression.includes("÷0") || jsExpression.includes("÷ 0")) {
            throw new Error("Division by zero");
        }

        const result = Function('"use strict"; return (' + jsExpression + ")")();

        if (!isFinite(result)) {
            throw new Error("Result is infinite or undefined");
        }

        return result;
    } catch (error) {
        throw new Error(`Invalid expression!`);
    }
}

function calculate() {
    try {
        // Get the expression directly from the editable display for evaluation
        let fullExpression = expressionDisplay.textContent;

        // Remove the dynamically added open parentheses span if it's there
        const openParenSpan = expressionDisplay.querySelector('.open-parentheses');
        if (openParenSpan) {
            fullExpression = fullExpression.replace(openParenSpan.textContent, '');
        }

        // If currentInput is not "0" and is not already part of the fullExpression
        // This heuristic tries to append the current number being typed if it's not already in the display
        // This is a common calculator behavior.
        if (currentInput === "0" && fullExpression.trim().slice(-1)==="÷"){
          throw new Error("Error: Division by zero!")
        }
        if (currentInput !== "0" && !waitingForOperand) {
            const lastCharInDisplay = fullExpression.trim().slice(-1);
            const endsWithOperator = ['+', '-', '×', '÷', '^', '('].includes(lastCharInDisplay);
            if (fullExpression === "" || endsWithOperator) {
                fullExpression += currentInput;
            }
        } else if (currentInput !== "0" && waitingForOperand && expression === "") {
            // This handles cases where only a number was typed and then '=' is pressed
            fullExpression = currentInput;
        }

        // Re-evaluate openParentheses count from the actual content of the display for calculation purposes
        const openCount = (fullExpression.match(/\(/g) || []).length;
        const closeCount = (fullExpression.match(/\)/g) || []).length;
        const netOpenParentheses = openCount - closeCount;

        // Close any remaining open parentheses for evaluation
        fullExpression += ")".repeat(Math.max(0, netOpenParentheses));

        if (!fullExpression.trim()) {
            currentInput = "0";
            expression = "";
            openParentheses = 0; // Reset internal count
            waitingForOperand = false;
            updateDisplay();
            return;
        }

        const result = evaluateExpression(fullExpression);
        currentInput = String(result);
        expression = ""; // Clear the internal expression variable after calculation
        openParentheses = 0; // Reset internal count
        waitingForOperand = true;
        updateDisplay(); // Update display with new result
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
    expressionDisplay.textContent = ""; // Clear the editable display
    updateDisplay();
}

// New backspace function
function backspace() {
    if (isError) {
        clearAll();
        return;
    }

    // If currentInput is the one being actively typed, remove from it
    if (currentInput !== "0" && !waitingForOperand) {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = "0";
        }
    } else {
        // If currentInput is "0" (meaning an operator was just pressed or display is empty)
        // and the expression display has content, remove from expressionDisplay
        if (expressionDisplay.textContent.length > 0) {
            expressionDisplay.textContent = expressionDisplay.textContent.slice(0, -1);
            // Also update internal 'expression' variable to keep it somewhat in sync
            expression = expressionDisplay.textContent;
        } else {
            currentInput = "0";
        }
    }
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

    // If the expressionDisplay is focused, let the browser handle typing and backspace
    if (document.activeElement === expressionDisplay) {
        // We still want to handle 'Enter' for calculation
        if (key === "Enter") {
            event.preventDefault(); // Prevent new line in contenteditable
            calculate();
        } else if (key === "Escape") {
            clearAll();
        }
        // For all other keys, let contenteditable handle it.
        // The 'input' event listener on expressionDisplay will pick up changes.
        return;
    }

    // Normal calculator keydown handling when expressionDisplay is not focused
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
    } else if (key === "Backspace") {
        backspace(); // Call the new backspace function
    }
});

// Initial display update
updateDisplay();
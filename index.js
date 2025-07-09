
        let display = document.getElementById('result');
        let currentInput = '';
        let shouldResetDisplay = false;

        // Add floating particles
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 4000);
        }

        // Create particles periodically
        setInterval(createParticle, 2000);

        function appendToDisplay(value) {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }

            if (display.textContent === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            
            display.textContent = currentInput || '0';
            display.classList.remove('error');
            
            // Add glow effect
            display.parentElement.classList.add('glow');
            setTimeout(() => {
                display.parentElement.classList.remove('glow');
            }, 200);
        }

        function clearDisplay() {
            currentInput = '';
            display.textContent = '0';
            display.classList.remove('error');
            shouldResetDisplay = false;
            
            // Add clear effect
            display.style.animation = 'none';
            setTimeout(() => {
                display.style.animation = '';
            }, 100);
        }

        function deleteLast() {
            if (shouldResetDisplay) {
                clearDisplay();
                return;
            }
            
            currentInput = currentInput.slice(0, -1);
            display.textContent = currentInput || '0';
            display.classList.remove('error');
        }

        function calculateResult() {
            try {
                if (!currentInput) return;
                
                let expression = currentInput
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/−/g, '-');
                
                let openCount = (expression.match(/\(/g) || []).length;
                let closeCount = (expression.match(/\)/g) || []).length;
                
                if (openCount !== closeCount) {
                    throw new Error('Mismatched parentheses');
                }
                
                if (/[+\-*/^]{2,}/.test(expression)) {
                    throw new Error('Invalid operation');
                }
                
                let result = eval(expression);
                
                if (!isFinite(result)) {
                    throw new Error('Invalid result');
                }
                
                if (result % 1 === 0) {
                    if (result.toString().length > 12) {
                        result = result.toExponential(3);
                    } else {
                        result = result.toString();
                    }
                } else {
                    result = parseFloat(result.toFixed(10)).toString();
                    if (result.length > 12) {
                        result = parseFloat(result).toExponential(3);
                    }
                }
                
                display.textContent = result;
                currentInput = result;
                shouldResetDisplay = true;
                
                // Success animation
                display.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    display.style.transform = 'scale(1)';
                }, 200);
                
            } catch (error) {
                display.textContent = 'Error';
                display.classList.add('error');
                currentInput = '';
                shouldResetDisplay = true;
            }
        }

        // Enhanced ripple effect
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                let button = e.target;
                let rect = button.getBoundingClientRect();
                let ripple = document.createElement('span');
                let size = Math.max(rect.width, rect.height);
                let x = e.clientX - rect.left - size / 2;
                let y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', function(e) {
            const key = e.key;
            
            if (key >= '0' && key <= '9') {
                appendToDisplay(key);
            } else if (key === '.') {
                appendToDisplay('.');
            } else if (key === '+') {
                appendToDisplay('+');
            } else if (key === '-') {
                appendToDisplay('-');
            } else if (key === '*') {
                appendToDisplay('*');
            } else if (key === '/') {
                e.preventDefault();
                appendToDisplay('/');
            } else if (key === '(') {
                appendToDisplay('(');
            } else if (key === ')') {
                appendToDisplay(')');
            } else if (key === 'Enter' || key === '=') {
                calculateResult();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                deleteLast();
            } else if (key === '^') {
                appendToDisplay('**');
            }
        });

        // Initialize particles
        for (let i = 0; i < 3; i++) {
            setTimeout(createParticle, i * 1000);
        }
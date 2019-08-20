// 2019-03-03 | Tom Paoloni | Created file
// 2019-03-18 | Austin Pearce | Added event listeners and buttonPressHandler
// 2019-03-19 | Brandon Arbuthnot | Basic math functionality
// 2019-03-19 | Tom Paoloni | Negative button fix
// 2019-03-19 | Tom Paoloni | PEMDAS fixes
// 2019-03-19 | Austin Pearce | Add keyboard press listeners
// 2019-03-20 | Austin Pearce | Clean up keyboard code
// 2019-03-21 | JS Teoh | Added memory functions
// 2019-03-21 | JS Teoh | Added special functions (additional features)

/* =========================================== */
/* ================= GLOBALS ================= */
/* =========================================== */

// Text currently on the two areas of the screen
var calculatorText = '';
var smallText = '';

// An array of tokens that make up a math expression (i.e. 1+2 => [1, '+', 2])
var expression = [];

// Boolean used to tell whether the number on the screen is one being entered
// or the result of a calculation. False when you are currently entering a number,
// true after pressing the equals button.
var newNum = false;
var postSp = false;

// Used for mapping keyboard buttons to the inner text of the calculator buttons
var buttons = {};
var buttonMap = {
  '*': '×',
  '/': '÷',
  'Enter': '=',
  'Backspace': '←',
  'ArrowLeft': '←',
  'c': 'C'
};

// Used for storing a number in memory (MS, MR, M+, M-)
var numberInMemory = 0;

// Reference to the calculator screen element
const screen = document.getElementById('screen');

/* =========================================== */
/* ============ KEYBOARD HANDLING ============ */
/* =========================================== */

/**
 * Simulates a button press down
 *
 * 2019-03-19 | Austin Pearce | Function created
 *
 * @param {HTMLButtonElement} element
 */
function simPress (element) {
  if (element !== undefined) {
    element.click();
    element.classList.add('active');
  }
}

/**
 * Simulates a button release
 *
 * 2019-03-19 | Austin Pearce | Function created
 *
 * @param {HTMLButtonElement} element
 */
function simUp (element) {
  if (element !== undefined) {
    element.classList.remove('active');
  }
}

/**
 * Handles keyboard button presses
 *
 * 2019-03-19 | Austin Pearce | Function created
 * 2019-03-20 | Austin Pearce | Function refactored
 *
 * @param {KeyboardEvent} event
 */
function keyPressHandler (event) {
  var key = event.key;
  if (buttonMap.hasOwnProperty(key)) {
    key = buttonMap[key];
  }
  if (event.type === 'keydown') {
    simPress(buttons[key]);
  } else {
    simUp(buttons[key]);
  }
}

// Register event handlers for key presses
var body = document.querySelector('body');
body.addEventListener('keydown', keyPressHandler, false);
body.addEventListener('keyup', keyPressHandler, false);

/* ========================================== */
/* ============= CLICK HANDLING ============= */
/* ========================================== */

/**
 * Handles button clicks for number buttons and the decimal point
 *
 * 2019-03-19 | Brandon Arbuthnot | Wrote buttonPressHandler
 * 2019-03-19 | Tom Paoloni | Simplified logic, added overflow condition
 * 2019-03-19 | Tom Paoloni | Seperated logic into numButtonPressHandler
 *
 * @param {MouseEvent} event
 */
function numButtonPressHandler (event) {
  if (calculatorText.length < 13) {
    if (newNum) {
      expression = [];
      calculatorText = '';
      newNum = false;
    }
    if (postSp) {
      calculatorText = '';
      postSp = false;
    }

    if (!isNaN(parseFloat(expression[expression.length - 1]))) {
      expression.pop();
    }
    calculatorText += event.target.innerHTML;
    pushFloat(calculatorText);
  }
  updateScreen();
}

/**
 * Handles button clicks for operation buttons
 *
 * 2019-03-19 | Brandon Arbuthnot | Wrote buttonPressHandler
 * 2019-03-19 | Tom Paoloni | Fixed issues with +/-, added overflow conditions
 * 2019-03-19 | Tom Paoloni | Seperated logic into opButtonPressHandler
 *
 * @param {MouseEvent} event
 */
function opButtonPressHandler (event) {
  switch (event.target.innerHTML) {
    // Cases for the clear buttons
    case 'C':
      newNum = false;
      postSp = false;
      expression = [];
      smallText = '';
      calculatorText = '';
      break;
    case 'CE':
      newNum = false;
      postSp = false;
      if (calculatorText !== '') {
        expression.pop();
        calculatorText = '';
      }
      break;
    case '←':
      if (!newNum && !postSp) {
        calculatorText = calculatorText.slice(0, -1);
        expression.pop();
        pushFloat(calculatorText);
      } else {
        postSp = false;
        newNum = false;
        calculatorText = '';
      }
      break;
    // Cases for the various math operator buttons
    case '+':
    case '-':
    case '×':
    case '÷':
      newNum = false;
      postOp(event.target.innerHTML);
      break;
    case '±':
      if (calculatorText === '-') {
        calculatorText = '';
      } else if (calculatorText !== '') {
        calculatorText = expression.pop();
        calculatorText *= -1;
        calculatorText = calculatorText.toString();
        pushFloat(calculatorText);
      } else {
        calculatorText = '-' + calculatorText;
      }
      break;
    case '=':
      newNum = true;
      if (isNaN(parseFloat(expression[expression.length - 1]))) {
        expression.pop();
      }
      if (expression.length > 0) {
        calculatorText = roundFloatString(evalFunc(), 12);
      }
      smallText = '';
      break;
  }
  updateScreen();
}

/**
 * Handles button clicks for special buttons
 *
 * 2019-03-21 | JS Teoh | Wrote spButtonPressHandler
 * 2019-03-21 | Tom Paoloni | Moved repetitive logic
 *
 * @param {MouseEvent} event
 */
function spButtonPressHandler (event) {
  expression.pop();
  postSp = true;
  var spOut;
  switch (event.target.innerHTML) {
    case '√':
      spOut = Math.sqrt(parseFloat(calculatorText));
      break;
    case 'log':
      spOut = Math.log10(parseFloat(calculatorText));
      break;
    case 'ln':
      spOut = Math.log(parseFloat(calculatorText));
      break;
    case 'x<sup>2</sup>':
      spOut = Math.pow(parseFloat(calculatorText), 2);
      break;
    case 'sin':
      spOut = Math.sin(parseFloat(calculatorText));
      break;
    case 'cos':
      spOut = Math.cos(parseFloat(calculatorText));
      break;
    case 'tan':
      spOut = Math.tan(parseFloat(calculatorText));
      break;
    case 'e<sup>x</sup>':
      spOut = Math.pow(Math.E, parseFloat(calculatorText));
      break;
    case 'sin<sup>-1</sup>':
      spOut = Math.asin(parseFloat(calculatorText));
      break;
    case 'cos<sup>-1</sup>':
      spOut = Math.acos(parseFloat(calculatorText));
      break;
    case 'tan<sup>-1</sup>':
      spOut = Math.atan(parseFloat(calculatorText));
      break;
    case 'deg':
      spOut = parseFloat(calculatorText) * 180 / Math.PI;
      break;
  }
  calculatorText = roundFloatString(spOut, 12).toString();
  if (calculatorText !== 'NaN') {
    pushFloat(calculatorText);
  }
  updateScreen();
}

/**
 * Handles button clicks for memory buttons
 *
 * 2019-03-21 | JS Teoh | Wrote memButtonPressHandler
 *
 * @param {MouseEvent} event
 */
function memButtonPressHandler (event) {
  switch (event.target.innerHTML) {
    // Cases for the memory buttons
    case 'MR':
      // Displays number in memory
      newNum = false;
      calculatorText = numberInMemory;
      pushFloat(calculatorText);
      break;
    case 'MS':
      // Stores the number in memory
      newNum = true;
      if (calculatorText !== '') {
        numberInMemory = roundFloatString(evalFunc(), 12);
      } else {
        numberInMemory = 0;
      }
      break;
    case 'M+':
      // Adds the number in memory to the number in the display
      if (calculatorText !== '') {
        numberInMemory = (parseFloat(numberInMemory) + parseFloat(calculatorText)).toString();
      }
      break;
    case 'M-':
      // Subtracts the number in memory from the number in the display (memory=5, display=4, M- =1)
      if (calculatorText !== '') {
        numberInMemory = (parseFloat(numberInMemory) - parseFloat(calculatorText)).toString();
      }
      break;
  }
  updateScreen();
}

// Register event handlers for each button
var children = document.getElementById('button-panel').children;
for (var btn of children) {
  var listener;
  switch (btn.className) {
    case 'num-button':
      listener = numButtonPressHandler;
      break;
    case 'op-button':
      listener = opButtonPressHandler;
      break;
    case 'mem-button':
      listener = memButtonPressHandler;
      break;
    case 'sp-button':
      listener = spButtonPressHandler;
  }
  btn.addEventListener('click', listener, false);
  buttons[btn.innerText] = btn;
}

/**
 * Updates the calculator screen. Called when a button is pressed
 *
 * 2019-03-19 | Brandon Arbuthnot and Tom Paoloni | Function created
 */
function updateScreen () {
  var underscore;
  if (newNum || postSp) {
    underscore = '';
  } else {
    underscore = '_';
  }
  screen.innerHTML = '<small>' + smallText + ' </small>' + '<p>' + calculatorText + underscore + '</p>';
}

/* ========================================== */
/* =============== MATH LOGIC =============== */
/* ========================================== */

/**
 * Given a float string and a number of digits, truncates the
 * string to that number of digits and rounds the last digit
 *
 * 2019-03-19 | Tom Paoloni | Function created
 *
 * @param {Number} num
 * @param {Number} numDigits
 */
function roundFloatString (num, numDigits) {
  var numStr = num.toString();
  var exponent = '';
  if ((num > parseInt('9'.repeat(numDigits - 4)) && num !== Infinity) || (num > 0 && num < 0.0001 && num !== -Infinity)) {
    numStr = num.toExponential().toString();
    exponent = numStr.slice(numStr.indexOf('e'), numStr.length);
    numStr = numStr.slice(0, numStr.indexOf('e'));
    var exp = parseInt(exponent.slice(1));
    if (exp > 99 || exp < -99) {
      return 'OUT OF RANGE';
    }
    numDigits -= 4;
  }

  var rounded = numStr.slice(0, numDigits + 1);
  if (rounded.length > numDigits) {
    var lastDigit = parseInt(rounded[numDigits]);
    if (lastDigit >= 5 && lastDigit !== 9) {
      lastDigit++;
    }
    rounded = rounded.slice(0, 11) + lastDigit;
  }
  // parsing to float drops all trailing 0's after the decimal point
  return parseFloat(rounded).toString() + exponent;
}

/**
 * Takes two numbers and applies a binary operation to them, returning the result
 *
 * 2019-03-19 | Brandon Arbuthnot | Function created
 *
 * @param {Number} num1
 * @param {String} op
 * @param {Number} num2
 */
function apply (num1, op, num2) {
  var result = parseFloat(num1);
  switch (op) {
    case '+':
      result += parseFloat(num2);
      break;
    case '-':
      result -= parseFloat(num2);
      break;
    case '×':
      result *= parseFloat(num2);
      break;
    case '÷':
      result /= parseFloat(num2);
      break;
  }
  return result;
}

/**
 * Takes a list of operations and runs through the
 * expression tokens, applying that operation to the
 * two surrounding numbers for each instance of that
 * operator in expression.
 *
 * 2019-03-19 | Tom Paoloni | Function created
 *
 * @param {Array} opArray
 */
function applyOps (opArray) {
  for (var i = 0; i < expression.length; i++) {
    if (opArray.indexOf(expression[i]) !== -1) {
      expression[i - 1] = apply(expression[i - 1], expression[i], expression[i + 1]);
      expression.splice(i, 2);
      i -= 2;
    }
  }
}

/**
 * Takes the tokenized expression and evaluates it, returning the result
 *
 * 2019-03-19 | Brandon Arbuthnot | Function created
 * 2019-03-19 | Tom Paoloni | Function refactored
 */
function evalFunc () {
  applyOps(['÷', '×']);
  applyOps(['+', '-']);
  var result = expression[0];
  return result;
}

/**
 * Takes a number string, converts it to a float, and adds it to the expression tokens.
 *
 * 2019-03-19 | Brandon Arbuthnot | Function created
 *
 * @param {String} floatStr
 */
function pushFloat (floatStr) {
  if (floatStr.length > 0 && floatStr !== '.') {
    expression.push(parseFloat(floatStr));
  }
}

/**
 * Adds a math operator in the form of a string to the expression tokens.
 *
 * 2019-03-19 | Brandon Arbuthnot | Function created
 *
 * @param {String} strOp
 */
function postOp (strOp) {
  if (expression.length > 0 && !(isNaN(parseFloat(expression[expression.length - 1])))) {
    smallText += calculatorText;
    smallText += strOp;
    expression.push(strOp);
  }
  calculatorText = '';
}

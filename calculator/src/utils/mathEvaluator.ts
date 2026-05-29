// Safe and robust mathematical expression parser and evaluator using Shunting-Yard algorithm.
// Supports: +, -, *, /, ^, !, %, brackets, functions (sin, cos, tan, ln, log, sqrt) and constants (pi, e).

export type AngleMode = 'deg' | 'rad';

type TokenType =
  | 'NUMBER'
  | 'OPERATOR'
  | 'FUNCTION'
  | 'LPAREN'
  | 'RPAREN'
  | 'CONSTANT'
  | 'POSTFIX';

interface Token {
  type: TokenType;
  value: string;
}

// Factorial function helper
const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) {
    // Gamma function approximation for non-integers (simple version or just restrict to integers)
    // For a calculator, integer factorial is standard, let's keep it integer-based or return NaN for float.
    return NaN;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    if (!isFinite(result)) return Infinity;
  }
  return result;
};

// Main Evaluation Class
export class MathEvaluator {
  private static operators: Record<string, { precedence: number; associativity: 'left' | 'right' }> = {
    '+': { precedence: 2, associativity: 'left' },
    '-': { precedence: 2, associativity: 'left' },
    '*': { precedence: 3, associativity: 'left' },
    '/': { precedence: 3, associativity: 'left' },
    '^': { precedence: 4, associativity: 'right' },
  };

  private static functions = new Set(['sin', 'cos', 'tan', 'ln', 'log', 'sqrt']);
  private static constants: Record<string, number> = {
    'π': Math.PI,
    'e': Math.E,
  };

  /**
   * Cleans up the input formula from display format to parseable format.
   */
  public static sanitize(expression: string): string {
    return expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/mod/g, '%') // support modulo if needed
      .trim();
  }

  /**
   * Tokenizes an expression string.
   */
  private static tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const sanitized = this.sanitize(expression);

    while (i < sanitized.length) {
      const char = sanitized[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // 1. Numbers (including decimals)
      if (/[0-9.]/.test(char)) {
        let numStr = '';
        while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
          numStr += sanitized[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: numStr });
        continue;
      }

      // 2. Constants (π, e)
      if (char === 'π' || char === 'e') {
        tokens.push({ type: 'CONSTANT', value: char });
        i++;
        continue;
      }

      // 3. Parentheses
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      // 4. Postfix operators (! and %)
      if (char === '!' || char === '%') {
        tokens.push({ type: 'POSTFIX', value: char });
        i++;
        continue;
      }

      // 5. Operators (+, -, *, /, ^)
      if (['+', '-', '*', '/', '^'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // 6. Functions (sin, cos, tan, ln, log, sqrt)
      if (/[a-zA-Z]/.test(char)) {
        let funcStr = '';
        while (i < sanitized.length && /[a-zA-Z]/.test(sanitized[i])) {
          funcStr += sanitized[i];
          i++;
        }
        if (this.functions.has(funcStr)) {
          tokens.push({ type: 'FUNCTION', value: funcStr });
        } else {
          throw new Error(`Unknown function/identifier: ${funcStr}`);
        }
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    return tokens;
  }

  /**
   * Applies implicit multiplication.
   * Examples:
   *   2(3+4) -> 2*(3+4)
   *   (2+3)(4+5) -> (2+3)*(4+5)
   *   5π -> 5*π
   *   πe -> π*e
   *   5sin(30) -> 5*sin(30)
   */
  private static insertImplicitMultiplication(tokens: Token[]): Token[] {
    const result: Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      result.push(current);

      if (i < tokens.length - 1) {
        const next = tokens[i + 1];

        // Cases where multiplication is implicit:
        // 1. NUMBER followed by LPAREN, FUNCTION, CONSTANT, or another NUMBER (though another number shouldn't happen)
        // 2. CONSTANT followed by LPAREN, FUNCTION, CONSTANT, or NUMBER
        // 3. RPAREN followed by LPAREN, FUNCTION, CONSTANT, or NUMBER
        // 4. POSTFIX followed by LPAREN, FUNCTION, CONSTANT, or NUMBER
        const currentCanBeLeftOfMultiplication =
          current.type === 'NUMBER' ||
          current.type === 'CONSTANT' ||
          current.type === 'RPAREN' ||
          (current.type === 'POSTFIX' && current.value !== '%'); // let's be careful with %: "50% 200" is usually 50% * 200, so yes, implicit multi is good

        const nextCanBeRightOfMultiplication =
          next.type === 'NUMBER' ||
          next.type === 'CONSTANT' ||
          next.type === 'LPAREN' ||
          next.type === 'FUNCTION';

        if (currentCanBeLeftOfMultiplication && nextCanBeRightOfMultiplication) {
          result.push({ type: 'OPERATOR', value: '*' });
        }
      }
    }

    return result;
  }

  /**
   * Handles unary operators (+ and -).
   * We convert unary minus to a negative number or a special operation.
   * If a minus is at the start of expression, or immediately after an operator or LPAREN, it's unary.
   */
  private static handleUnaryOperators(tokens: Token[]): Token[] {
    const result: Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];

      if (current.type === 'OPERATOR' && (current.value === '-' || current.value === '+')) {
        const isUnary =
          i === 0 ||
          tokens[i - 1].type === 'OPERATOR' ||
          tokens[i - 1].type === 'LPAREN';

        if (isUnary) {
          if (current.value === '-') {
            // Check if the next token is a number, we can just attach the minus to it
            if (i < tokens.length - 1 && tokens[i + 1].type === 'NUMBER') {
              tokens[i + 1].value = '-' + tokens[i + 1].value;
              continue; // skip pushing this minus operator
            } else if (i < tokens.length - 1 && tokens[i + 1].type === 'CONSTANT') {
              // For constants or functions, push a negative one multiplier: -1 * ...
              result.push({ type: 'NUMBER', value: '-1' });
              result.push({ type: 'OPERATOR', value: '*' });
              continue;
            } else if (i < tokens.length - 1 && (tokens[i + 1].type === 'LPAREN' || tokens[i + 1].type === 'FUNCTION')) {
              result.push({ type: 'NUMBER', value: '-1' });
              result.push({ type: 'OPERATOR', value: '*' });
              continue;
            }
          } else {
            // Unary plus can be ignored
            continue;
          }
        }
      }
      result.push(current);
    }

    return result;
  }

  /**
   * Converts infix tokens to postfix using Shunting-Yard.
   */
  private static shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER' || token.type === 'CONSTANT') {
        outputQueue.push(token);
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'POSTFIX') {
        outputQueue.push(token); // Postfix operators are evaluated immediately when popped in postfix
      } else if (token.type === 'OPERATOR') {
        const o1 = token.value;
        let top = operatorStack[operatorStack.length - 1];

        while (
          top &&
          (top.type === 'FUNCTION' ||
            (top.type === 'OPERATOR' &&
              ((this.operators[o1].associativity === 'left' &&
                this.operators[o1].precedence <= this.operators[top.value].precedence) ||
                (this.operators[o1].associativity === 'right' &&
                  this.operators[o1].precedence < this.operators[top.value].precedence))))
        ) {
          outputQueue.push(operatorStack.pop()!);
          top = operatorStack[operatorStack.length - 1];
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let top = operatorStack[operatorStack.length - 1];
        while (top && top.type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
          top = operatorStack[operatorStack.length - 1];
        }
        if (!top) {
          throw new Error('Mismatched parentheses (missing open parenthesis)');
        }
        operatorStack.pop(); // Pop the '('

        // If the token at the top of the stack is a function token, pop it onto the output queue.
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
          outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop()!;
      if (top.type === 'LPAREN') {
        throw new Error('Mismatched parentheses (missing closing parenthesis)');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluates a postfix queue of tokens.
   */
  private static evaluatePostfix(postfix: Token[], angleMode: AngleMode): number {
    const stack: number[] = [];

    for (const token of postfix) {
      if (token.type === 'NUMBER') {
        const val = parseFloat(token.value);
        if (isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
        stack.push(val);
      } else if (token.type === 'CONSTANT') {
        const val = this.constants[token.value];
        if (val === undefined) throw new Error(`Unknown constant: ${token.value}`);
        stack.push(val);
      } else if (token.type === 'POSTFIX') {
        const arg = stack.pop();
        if (arg === undefined) throw new Error('Empty stack for postfix operator');

        if (token.value === '!') {
          stack.push(factorial(arg));
        } else if (token.value === '%') {
          stack.push(arg / 100);
        }
      } else if (token.type === 'OPERATOR') {
        const right = stack.pop();
        const left = stack.pop();

        if (left === undefined || right === undefined) {
          throw new Error(`Missing operands for operator: ${token.value}`);
        }

        switch (token.value) {
          case '+':
            stack.push(left + right);
            break;
          case '-':
            stack.push(left - right);
            break;
          case '*':
            stack.push(left * right);
            break;
          case '/':
            if (right === 0) throw new Error('Cannot divide by zero');
            stack.push(left / right);
            break;
          case '^':
            stack.push(Math.pow(left, right));
            break;
          default:
            throw new Error(`Unknown operator: ${token.value}`);
        }
      } else if (token.type === 'FUNCTION') {
        const arg = stack.pop();
        if (arg === undefined) throw new Error(`Missing argument for function: ${token.value}`);

        switch (token.value) {
          case 'sin':
            const sinVal = angleMode === 'deg' ? arg * (Math.PI / 180) : arg;
            // Handle float precision issue e.g. sin(180) = 0, sin(360) = 0
            const sinRes = Math.sin(sinVal);
            stack.push(Math.abs(sinRes) < 1e-14 ? 0 : sinRes);
            break;
          case 'cos':
            const cosVal = angleMode === 'deg' ? arg * (Math.PI / 180) : arg;
            // Handle float precision issue e.g. cos(90) = 0
            const cosRes = Math.cos(cosVal);
            stack.push(Math.abs(cosRes) < 1e-14 ? 0 : cosRes);
            break;
          case 'tan':
            const tanVal = angleMode === 'deg' ? arg * (Math.PI / 180) : arg;
            // Check for undefined tan (e.g. 90 deg, 270 deg)
            if (angleMode === 'deg' && (Math.abs(arg) - 90) % 180 === 0) {
              throw new Error('Tangent undefined');
            }
            const tanRes = Math.tan(tanVal);
            stack.push(Math.abs(tanRes) < 1e-14 ? 0 : tanRes);
            break;
          case 'ln':
            if (arg <= 0) throw new Error('Domain error for ln');
            stack.push(Math.log(arg));
            break;
          case 'log':
            if (arg <= 0) throw new Error('Domain error for log');
            stack.push(Math.log10(arg));
            break;
          case 'sqrt':
            if (arg < 0) throw new Error('Imaginary numbers not supported');
            stack.push(Math.sqrt(arg));
            break;
          default:
            throw new Error(`Unknown function: ${token.value}`);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Evaluation error: incomplete expression');
    }

    return stack[0];
  }

  /**
   * Helper to format decimal numbers to avoid JavaScript floating point errors like 0.1 + 0.2 = 0.30000000000000004.
   */
  public static formatResult(num: number): string {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Infinity';

    // Check if it's an integer
    if (Number.isInteger(num)) {
      return num.toString();
    }

    // Format float to fixed precision
    const fixed = parseFloat(num.toFixed(10));
    
    // Check if it's in scientific notation
    if (Math.abs(fixed) > 1e12 || (Math.abs(fixed) < 1e-6 && fixed !== 0)) {
      return num.toExponential(6);
    }
    
    return fixed.toString();
  }

  /**
   * Evaluates the expression and returns the formatted result.
   */
  public static evaluate(expression: string, angleMode: AngleMode = 'deg'): string {
    if (!expression || expression.trim() === '') return '';

    try {
      let tokens = this.tokenize(expression);
      tokens = this.insertImplicitMultiplication(tokens);
      tokens = this.handleUnaryOperators(tokens);
      const postfix = this.shuntingYard(tokens);
      const val = this.evaluatePostfix(postfix, angleMode);
      return this.formatResult(val);
    } catch (error: any) {
      return `Error: ${error.message || 'Syntax Error'}`;
    }
  }

  /**
   * Performs an evaluation for real-time preview (doesn't throw, just returns empty or partial results).
   */
  public static previewEvaluate(expression: string, angleMode: AngleMode = 'deg'): string {
    if (!expression || expression.trim() === '') return '';

    // Check if expression is just a number or constant
    const sanitized = this.sanitize(expression);
    if (/^-?[0-9.]+$/.test(sanitized)) {
      return ''; // No preview needed if it's already a single number
    }

    // Attempt to balance parenthesis temporarily for preview evaluation
    let balancedExpr = expression;
    const openParens = (expression.match(/\(/g) || []).length;
    const closeParens = (expression.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      balancedExpr += ')'.repeat(openParens - closeParens);
    }

    // If it ends with an operator, strip it for preview
    let trimmedExpr = balancedExpr.trim();
    if (['+', '-', '×', '÷', '^', '*', '/'].includes(trimmedExpr[trimmedExpr.length - 1])) {
      trimmedExpr = trimmedExpr.slice(0, -1);
    }

    try {
      let tokens = this.tokenize(trimmedExpr);
      tokens = this.insertImplicitMultiplication(tokens);
      tokens = this.handleUnaryOperators(tokens);
      const postfix = this.shuntingYard(tokens);
      const val = this.evaluatePostfix(postfix, angleMode);
      
      if (isNaN(val) || !isFinite(val)) return '';
      
      const formatted = this.formatResult(val);
      // Don't show preview if it is identical to the current input
      if (formatted.replace(/\s/g, '') === expression.replace(/\s/g, '')) {
        return '';
      }
      return formatted;
    } catch (e) {
      // Return empty string on preview errors (e.g. while expression is being typed)
      return '';
    }
  }
}

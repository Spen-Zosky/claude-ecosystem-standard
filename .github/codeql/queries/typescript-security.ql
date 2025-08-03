/**
 * @name TypeScript Security Patterns for CES v2.7.0
 * @description Custom security queries for Claude Ecosystem Standard
 * @kind problem
 * @problem.severity warning
 * @security-severity 8.0
 * @precision high
 * @id typescript/ces-security-patterns
 * @tags security
 *       typescript
 *       anthropic
 *       enterprise
 */

import javascript

/**
 * Anthropic API Key Exposure Detection
 */
class AnthropicApiKeyExposure extends StringLiteral {
  AnthropicApiKeyExposure() {
    this.getValue().matches("sk-ant-%")
  }
}

/**
 * Unsafe Dynamic Property Access
 */
class UnsafeDynamicAccess extends PropertyAccess {
  UnsafeDynamicAccess() {
    exists(StringLiteral prop |
      this.getPropertyName() = prop.getValue() and
      prop.getValue().matches("%eval%") or
      prop.getValue().matches("%Function%") or
      prop.getValue().matches("%constructor%")
    )
  }
}

/**
 * Missing Input Validation
 */
class MissingInputValidation extends CallExpr {
  MissingInputValidation() {
    this.getCalleeName() = "JSON.parse" and
    not exists(TryStmt try | try.getBlock().getAChild*() = this)
  }
}

/**
 * Unsafe Process Environment Access
 */
class UnsafeEnvAccess extends PropertyAccess {
  UnsafeEnvAccess() {
    this.getBase().(PropertyAccess).getBase().toString() = "process" and
    this.getBase().(PropertyAccess).getPropertyName() = "env" and
    not exists(ConditionalExpr cond | cond.getTest().getAChild*() = this)
  }
}

/**
 * Missing Error Boundaries in Async Operations
 */
class UnhandledAsyncOperation extends AwaitExpr {
  UnhandledAsyncOperation() {
    not exists(TryStmt try | try.getBlock().getAChild*() = this) and
    not exists(CallExpr call | 
      call.getCalleeName() = "catch" and 
      call.getReceiver() = this.getOperand()
    )
  }
}

from Expr e, string message
where
  (
    e instanceof AnthropicApiKeyExposure and
    message = "Potential Anthropic API key hardcoded in source code"
  ) or
  (
    e instanceof UnsafeDynamicAccess and
    message = "Unsafe dynamic property access detected"
  ) or
  (
    e instanceof MissingInputValidation and
    message = "JSON.parse without proper error handling"
  ) or
  (
    e instanceof UnsafeEnvAccess and
    message = "Unsafe process.env access without validation"
  ) or
  (
    e instanceof UnhandledAsyncOperation and
    message = "Async operation without proper error handling"
  )
select e, message
# Project Policy - Cyberpunk Pug Cafe Chatbot

## Overview
This document establishes the development policy and lifecycle for the Cyberpunk Pug Cafe chatbot project. All development work must follow these guidelines to ensure quality, reliability, and maintainability.

## 🟩 Core Policies

### File Format Policy
- **All project and task files must be Markdown** with YAML frontmatter or pure YAML
- **No binary files** for documentation - everything must be human-readable text
- **Version control friendly** - all changes tracked and reviewable

### Task Structure Policy
- **Each task is atomic, testable, and gated** - no large, monolithic changes
- **Tasks must not proceed until previous gates pass** - strict sequential validation
- **Clear success criteria** defined before implementation begins

### Failure Handling Policy
**On any failure OR uncertainty:**
1. **IMMEDIATELY update living docs:**
   - `TROUBLESHOOTING.md` - Add entry with full context per schema
   - `REPLICATION-NOTES.md` - Document recurring errors and environment deltas
2. **Open/append `ISSUE.md`** - Record failure and mitigation attempts
3. **HALT workflow** and wait for explicit human authorization before continuing
4. **No auto-retry** without human direction

## 🟩 Development Lifecycle

**Strict Sequence — Complete each phase before advancing:**

### 1. Plan Phase
**Objective:** Create atomic, testable plan as markdown/YAML
**Deliverables:**
- Task breakdown in markdown with YAML frontmatter
- Clear validation gates defined
- Success criteria specified
- Dependencies identified

**Template:**
```yaml
---
task: "Implement feature X"
context: "Background and requirements"
expected_outcome: "Measurable success criteria"
validation_gates: [unit, lint, type, docs]
---

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Implementation Plan
1. Step 1
2. Step 2
```

### 2. Build Phase
**Objective:** Implement solution with comprehensive documentation
**Requirements:**
- Write testable, maintainable code
- Update all relevant documentation
- Follow established patterns and conventions
- Include error handling and logging

**Deliverables:**
- Functional implementation
- Updated documentation
- Testable code structure

### 3. Validate Phase
**Objective:** Pass all validation gates cleanly
**Gates Required:**
- **`unit`**: `pytest -q` fully green
- **`lint`**: `ruff` or `flake8` clean
- **`type`**: `mypy` or `pyright` clean
- **`docs`**: Spec drift check passes (implementation matches documentation)

**Failure Handling:** Any gate failure triggers immediate documentation update and workflow halt.

### 4. Review Phase
**Objective:** Human or agent review for quality assurance
**Checklist:**
- [ ] Spec drift check - implementation matches requirements
- [ ] Code clarity and maintainability review
- [ ] Documentation accuracy and completeness
- [ ] Performance and security considerations

### 5. Release Phase
**Objective:** Merge/publish only after all previous phases pass
**Requirements:**
- All validation gates passed
- Review feedback addressed
- No outstanding issues in `ISSUE.md`
- Living documentation updated

## 🟩 Validation Gates Detail

### Unit Testing (`unit`)
- **Framework:** pytest with `pytest -q`
- **Coverage:** All new code must have unit tests
- **Success Criteria:** 100% tests pass, no failures or errors
- **Location:** `tests/` directory with `test_*.py` files

### Linting (`lint`)
- **Tools:** ruff (preferred) or flake8
- **Configuration:** Project-specific rules in `pyproject.toml` or `.flake8`
- **Success Criteria:** Zero linting errors or warnings
- **Automated:** Run via `ruff check .` or `flake8 .`

### Type Checking (`type`)
- **Tools:** mypy (preferred) or pyright
- **Configuration:** Strict type checking enabled
- **Success Criteria:** Zero type errors
- **Automated:** Run via `mypy .` or `pyright .`

### Documentation (`docs`)
- **Checks:** Implementation vs specification drift
- **Success Criteria:** All documented features implemented, no undocumented features
- **Process:** Manual review against requirements
- **Living Docs:** All changes reflected in appropriate documentation files

## 🟩 Living Documentation

### Required Files
- **`TROUBLESHOOTING.md`** - Issue resolution database
- **`REPLICATION-NOTES.md`** - Recurring errors and environment notes
- **`ISSUE.md`** - Current and resolved issues tracker

### Documentation Standards
Each entry must include:
- **Context:** Clear project/task background
- **Problem/Symptom:** What went wrong
- **Root Cause:** Technical analysis
- **Solution:** How it was resolved
- **Prevention:** How to avoid recurrence

### Update Triggers
**MANDATORY updates on:**
- Any validation gate failure
- Unexpected errors during development
- Performance issues or regressions
- User-reported problems
- Environment-specific issues

## 🟩 Quality Standards

### Code Quality
- **Readable:** Clear variable names, comments for complex logic
- **Maintainable:** Follow established patterns, avoid technical debt
- **Testable:** Dependency injection, clear interfaces
- **Secure:** Input validation, safe defaults

### Documentation Quality
- **Accurate:** Implementation matches documentation
- **Complete:** All features and edge cases covered
- **Current:** Updated with every change
- **Accessible:** Clear language, proper formatting

### Process Quality
- **Traceable:** Every change has documentation
- **Auditable:** Clear decision records
- **Reproducible:** Environment and setup documented
- **Recoverable:** Issues have clear resolution paths

## 🟩 Tooling & Automation

### Required Tools
- **Testing:** pytest for unit tests
- **Linting:** ruff for code quality
- **Type Checking:** mypy for type safety
- **Version Control:** git with conventional commits
- **Documentation:** Markdown with YAML frontmatter

### Automation Scripts
- **`scripts/test.sh`** - Run all validation gates
- **`scripts/lint.sh`** - Execute linting checks
- **`scripts/typecheck.sh`** - Run type checking
- **`scripts/validate.sh`** - Full validation pipeline

### CI/CD Integration
- **Pre-commit hooks:** Automatic validation on commit
- **CI Pipeline:** Full validation on pull requests
- **Release Automation:** Version bumping and changelog generation

## 🟩 Risk Management

### Technical Risks
- **Dependency failures:** Pin versions, use constraints.txt
- **Platform incompatibilities:** Test on target platforms
- **Performance regressions:** Include benchmarks in validation
- **Security vulnerabilities:** Regular dependency updates

### Process Risks
- **Documentation drift:** Regular audits against implementation
- **Validation gate bypass:** Strict enforcement, no exceptions
- **Knowledge silos:** Comprehensive documentation requirements
- **Burnout:** Sustainable pace, clear boundaries

### Mitigation Strategies
- **Early detection:** Comprehensive testing at each phase
- **Clear escalation:** Defined paths for issues and uncertainties
- **Knowledge sharing:** Living documentation as single source of truth
- **Quality gates:** No advancement without validation

## 🟩 Compliance & Enforcement

### Policy Compliance
- **Mandatory:** All policies must be followed for project contributions
- **Auditable:** Clear records of compliance in commit history
- **Enforceable:** Automated checks where possible
- **Documented:** Policy violations tracked in ISSUE.md

### Exception Process
**Exceptions require:**
1. Clear justification documented in ISSUE.md
2. Alternative approach proposed
3. Risk assessment completed
4. Explicit approval from project maintainer

### Continuous Improvement
- **Regular review:** Policy effectiveness assessed quarterly
- **Feedback integration:** Developer input incorporated
- **Evolution:** Policies updated based on lessons learned
- **Training:** New contributors onboarded with current policies

---

## Implementation Status

**Current Phase:** Establishing framework
**Next Steps:**
1. Create automation scripts for validation gates
2. Set up testing infrastructure
3. Implement CI/CD pipeline
4. Train team on new processes

**Adoption Date:** 2025-11-12
**Review Date:** 2026-02-12 (Quarterly)

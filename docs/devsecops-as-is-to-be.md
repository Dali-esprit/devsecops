# DevSecOps AS-IS / TO-BE Analysis

## 1. AS-IS — Before DevSecOps Controls

Before the DevSecOps controls were introduced, the project did not have an integrated security validation process covering the complete CI/CD lifecycle.

### Existing CI/CD
- GitHub Actions workflow is used for the active CI/CD pipeline.
- A GitLab CI configuration also exists in the repository.
- GitLab CI execution is currently limited by the GitLab identity-verification requirement.
- GitHub Actions is therefore the actively verified CI/CD execution environment.

### Security weaknesses identified
- No integrated security gates covering secrets, source code, dependencies, container images and running application.
- Security validation was not systematically executed before changes could progress through CI/CD.
- No automated notification mechanism for security failures.
- No documented OWASP Top 10 / ASVS alignment.
- Developer-side security checks were not initially integrated into the commit workflow.

## 2. TO-BE — Implemented DevSecOps Pipeline

The resulting pipeline integrates security controls throughout the software delivery lifecycle.

### Pipeline stages
1. Secrets scanning — Gitleaks
2. SAST — Semgrep with OWASP Top 10 rules
3. SCA — Trivy filesystem vulnerability scanning
4. Docker build — hardened application image
5. Docker image scanning — Trivy
6. DAST — OWASP ZAP baseline scan
7. Security failure notification — Slack

### Security gates
- Gitleaks returns a failing exit code when secrets are detected.
- Semgrep findings are evaluated by an explicit SAST quality gate.
- Trivy filesystem scanning blocks HIGH and CRITICAL vulnerabilities.
- Trivy container scanning blocks HIGH and CRITICAL vulnerabilities.
- DAST executes against the running application and generates HTML and JSON reports.
- ZAP informational warnings are non-blocking through the -I option.

## 3. Developer Shift-Left

Security controls are also available before CI/CD execution.

- SonarQube for IDE is installed in Visual Studio Code.
- ESLint with eslint-plugin-security is configured for the hardened Node.js application.
- Semgrep is executed locally through pre-commit.
- Gitleaks is executed locally through pre-commit.
- ESLint security checks are executed locally through pre-commit.

## 4. Verification Evidence

### SAST blocking test
A deliberately vulnerable JavaScript file using eval() with request-controlled input was temporarily introduced.
The GitHub Actions SAST job detected the vulnerability and failed the pipeline.
The Slack notification job also succeeded and delivered a security failure notification.
The vulnerable test file was then removed and the master branch returned to a successful pipeline state.

### Secret scanning
Gitleaks was executed against the repository and completed successfully with no unapproved secrets detected.
Intentional vulnerable training data from OWASP Juice Shop is explicitly allowlisted.

### Container security
The hardened application uses a multi-stage Docker build and a distroless Node.js runtime image.
Local Trivy verification showed no HIGH or CRITICAL vulnerabilities in the resulting image.

### Shift-left IDE verification
SonarQube for IDE detected a temporary eval() vulnerability involving user-controlled data.
The finding identified dynamic code execution as a high-security-risk issue.
The vulnerable code was removed afterwards.

## 5. Reporting and Alerting

Security jobs generate JSON and HTML reports where supported.
GitHub Actions preserves workflow results and uploaded artifacts.
Slack notifications are configured for security pipeline failures.

## 6. OWASP and ASVS Alignment

The project contains an OWASP Top 10 and ASVS mapping document in docs/owasp-mapping.md.
The mapping documents how implemented controls address relevant application-security risks.
It represents alignment with the selected controls and is not a claim of complete ASVS compliance.

## 7. Exception Process

Security findings should not be ignored silently.

1. Identify the finding and affected component.
2. Determine whether it is a true positive or false positive.
3. Document the technical justification.
4. Obtain project-owner approval for an exception.
5. Define an expiration or review date.
6. Prefer remediation over permanent suppression.

## 8. Result

The TO-BE architecture provides continuous security validation from developer workstation to CI/CD execution.
The repository now contains automated controls for secrets, SAST, dependencies, Docker images and the running application, with blocking quality gates and failure notification.

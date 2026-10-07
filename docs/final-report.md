# Final Report — DevSecOps Security Pipeline

## 1. Introduction

This project implements a DevSecOps approach for a Node.js application by integrating security controls throughout the software development and CI/CD lifecycle.

The objective is to move security activities closer to the developer, automate security validation in CI/CD, establish blocking security gates, and provide visibility when a security control fails.

The project uses GitHub Actions as the actively verified CI/CD platform. A GitLab CI configuration is also present in the repository, but GitLab execution is currently constrained by an identity-verification requirement.

## 2. Project Objectives

The main objectives are:

- Understand the DevSecOps and shift-left security approach.
- Integrate SAST, SCA, secrets scanning, Docker image scanning and DAST.
- Automate security controls on pushes and pull requests.
- Define security gates capable of blocking insecure changes.
- Provide developer-side security checks before code reaches CI/CD.
- Generate security reports and preserve CI/CD evidence.
- Notify the team when security controls fail.
- Map the implemented controls to OWASP Top 10 and selected ASVS requirements.

## 3. Initial State — AS-IS

Before the DevSecOps controls were introduced, the project did not have an integrated security validation process covering secrets, source code, dependencies, container images and the running application.

Security verification was not systematically enforced through automated quality gates, developer pre-commit checks and centralized failure notification.

The project therefore required security controls capable of detecting vulnerabilities earlier and preventing insecure artifacts from progressing through the delivery process.

A detailed AS-IS / TO-BE analysis is provided in docs/devsecops-as-is-to-be.md.

## 4. Target Architecture — TO-BE

The implemented architecture follows a layered DevSecOps model:

Developer workstation
→ SonarQube for IDE
→ pre-commit security checks
→ GitHub repository
→ GitHub Actions
→ Secrets scan
→ SAST
→ SCA
→ Docker build
→ Docker image scan
→ DAST
→ Slack notification on security failure

Security checks are triggered automatically on pushes and pull requests targeting the master branch.

## 5. Developer Shift-Left Security

Security is integrated into the developer workflow before CI/CD execution.

### SonarQube for IDE

SonarQube for IDE is installed in Visual Studio Code and provides immediate feedback while developing.

A temporary eval() vulnerability using user-controlled input was tested. SonarQube for IDE identified the issue as dynamic code execution using untrusted data, with high security impact.

### Pre-commit controls

The repository uses pre-commit hooks for:

- Gitleaks secret scanning.
- Semgrep security analysis.
- ESLint with eslint-plugin-security.

All three hooks were successfully executed during project commits.

## 6. CI/CD Security Controls

### 6.1 Secrets Scanning — Gitleaks

Gitleaks scans the repository for credentials and other sensitive information.
The CI job generates a JSON report and uses a failing exit code when an unapproved secret is detected.

Intentional vulnerable training data belonging to the OWASP Juice Shop test application is explicitly allowlisted through .gitleaks.toml.

Local verification completed successfully with no unapproved secrets detected.

### 6.2 SAST — Semgrep

Semgrep performs static application security testing using OWASP Top 10 rules against the hardened application.

The SAST stage includes an explicit quality gate. Blocking findings cause the job to fail.

A real blocking test was performed by temporarily introducing eval() with request-controlled input. Semgrep detected the vulnerability and the GitHub Actions SAST quality gate failed.

### 6.3 SCA — Trivy

Trivy performs filesystem dependency vulnerability scanning.
The configured security threshold targets HIGH and CRITICAL vulnerabilities.
A finding at or above the configured threshold causes the security job to fail.

### 6.4 Docker Image Security — Trivy

After the application image is built, Trivy scans the resulting container image.
The scan is configured to fail for HIGH and CRITICAL vulnerabilities.

The hardened image was locally verified and produced no HIGH or CRITICAL findings.

### 6.5 DAST — OWASP ZAP

OWASP ZAP performs dynamic analysis against the running hardened application.
The application is started inside the CI environment and the ZAP baseline scan targets the exposed HTTP service.

ZAP produces JSON and HTML reports. Informational warnings are non-blocking through the -I option.

## 7. Security Gates

The project applies the following security-gate strategy:

| Control | Tool | Threshold / Behavior | Blocking |
|---|---|---|---|
| Secrets | Gitleaks | Detected unapproved secrets | Yes |
| SAST | Semgrep | Blocking security findings | Yes |
| SCA | Trivy | HIGH / CRITICAL | Yes |
| Docker image | Trivy | HIGH / CRITICAL | Yes |
| DAST | OWASP ZAP | Baseline scan; informational warnings non-blocking | Partially |

This strategy prioritizes blocking high-impact vulnerabilities while avoiding pipeline failure for informational DAST warnings.

## 8. Verification and Security Testing

The implementation was validated through several independent tests.

### Successful pipeline

The final hardened state was pushed to GitHub and the GitHub Actions security pipeline completed successfully.

### SAST failure test

A deliberately vulnerable file was temporarily committed to the repository.
The code used eval() with request-controlled input.

Semgrep reported one blocking finding related to dynamic code execution and the SAST quality gate failed with exit code 1.

This demonstrates that the pipeline is not only capable of reporting vulnerabilities but can actively block an insecure change.

After the test, the vulnerable file was removed and the master branch returned to a successful state.

### Slack failure notification

During the SAST failure test, the notification job successfully sent a security failure message to Slack.
This confirms that pipeline failures can be communicated automatically to the development team.

### IDE verification

SonarQube for IDE detected the temporary eval() vulnerability locally before the code was restored.
This demonstrates the shift-left principle by detecting a security issue during development rather than waiting for CI/CD.

## 9. Reporting and Alerting

Security jobs generate machine-readable reports and, where applicable, HTML reports.
GitHub Actions preserves workflow execution history and uploaded artifacts.

Slack is configured to notify the team when one of the principal security/build jobs fails.
The notification includes the repository, branch and GitHub Actions run reference.

## 10. OWASP Top 10 and ASVS Alignment

The project contains docs/owasp-mapping.md, which maps implemented controls to relevant OWASP Top 10 risks and selected ASVS requirements.

The mapping demonstrates security alignment rather than claiming complete ASVS compliance.

The implemented controls address areas including injection risks, security misconfiguration, vulnerable dependencies, identification of secrets and insecure components.

## 11. Docker Security

The hardened application uses a multi-stage Docker build.

The build stage installs the required production dependencies, while the final runtime uses a distroless Node.js image.
This reduces the attack surface by excluding unnecessary build tooling from the final container.

The application runs as a non-root user.
The container exposes only the required application port.

Trivy was used to verify the resulting image, with HIGH and CRITICAL vulnerabilities configured as blocking findings.
The locally built hardened image passed this verification.

## 12. Exception and False-Positive Process

Security findings should be investigated before being suppressed.

The recommended exception process is:

1. Identify the finding, affected file or component, and security impact.
2. Determine whether the finding is a true positive or false positive.
3. Document the technical justification for any exception.
4. Obtain project-owner approval.
5. Define an expiration or review date.
6. Prefer remediation over permanent suppression.

The Gitleaks configuration demonstrates controlled exception handling for intentional OWASP Juice Shop training data.
Only explicitly identified training-data paths are allowlisted.

## 13. Results

The implemented solution achieved the main technical objectives of the project.

- Security checks execute automatically through GitHub Actions.
- Secrets scanning is automated with Gitleaks.
- SAST is automated with Semgrep.
- Dependency scanning is automated with Trivy.
- Docker images are scanned with Trivy.
- Dynamic application testing is performed with OWASP ZAP.
- Developer-side checks run through pre-commit.
- SonarQube for IDE provides immediate local security feedback.
- Security failures trigger Slack notification.
- Security reports are generated and retained by CI/CD.

The most important verification was the deliberate SAST failure test. The vulnerable eval() code caused the SAST quality gate to fail, proving that the security control can block an insecure change.

After removing the test vulnerability, the master branch returned to a successful pipeline.

## 14. Limitations and Future Improvements

The project intentionally focuses on the core DevSecOps controls required by the assignment.

Current limitations and possible improvements include:

- Deploying SonarQube Server or SonarQube Cloud for centralized project-level analysis.
- Adding an SBOM generation stage using a tool such as Syft or CycloneDX.
- Adding infrastructure-as-code scanning if infrastructure definitions become part of the production deployment.
- Introducing a dedicated security dashboard for long-term vulnerability trends.
- Extending notification channels beyond Slack if required.
- Reviewing GitHub Actions runtime warnings and updating action/runtime versions as the GitHub platform evolves.

These improvements are not required to demonstrate the core security pipeline implemented in this project.

## 15. Conclusion

This project demonstrates a practical DevSecOps implementation in which security is integrated from development through CI/CD.

The shift-left approach is implemented through SonarQube for IDE and pre-commit security checks, while GitHub Actions provides automated security validation for every push and pull request targeting master.

The combination of Gitleaks, Semgrep, Trivy and OWASP ZAP provides coverage across secrets, source code, dependencies, container images and the running application.

Most importantly, the project demonstrates an enforceable security gate rather than only passive reporting. The SAST failure test proved that a deliberately insecure change is detected and blocked automatically, while Slack provides immediate notification of the failure.

The resulting pipeline therefore supports the central DevSecOps objective: detecting and addressing security issues as early as possible while preventing serious vulnerabilities from progressing through the delivery process.

## 16. Evidence

The following evidence can be presented during the project demonstration:

1. GitHub Actions successful pipeline showing the security jobs.
2. GitHub Actions failed SAST test showing the blocking quality gate.
3. Slack message generated by the failed security pipeline.
4. SonarQube for IDE finding for the temporary eval() vulnerability.
5. Successful local Gitleaks scan.
6. Successful local Trivy Docker image scan.
7. Successful pre-commit execution of Gitleaks, Semgrep and ESLint Security.
8. docs/owasp-mapping.md containing the OWASP Top 10 / ASVS mapping.
9. docs/devsecops-as-is-to-be.md containing the AS-IS / TO-BE analysis.

Together, these artifacts provide reproducible evidence of the implemented DevSecOps controls.

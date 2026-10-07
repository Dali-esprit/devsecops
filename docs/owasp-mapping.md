# OWASP Top 10 / ASVS Security Mapping



## Purpose



This document maps the security controls implemented in the DevSecOps pipeline and hardened application to the OWASP Top 10 and OWASP Application Security Verification Standard (ASVS).



The objective is to demonstrate that security controls are aligned with recognized application-security practices and are applied continuously throughout the software development lifecycle.



\---



## OWASP Top 10 Mapping



| OWASP Top 10 | Risk | Implemented Control | Verification |

|---|---|---|---|

| A01:2021 Broken Access Control | Unauthorized access | Application security testing with SAST/DAST | Semgrep + OWASP ZAP |

| A02:2021 Cryptographic Failures | Exposure of sensitive data | Secret scanning and secure HTTP headers | Gitleaks + Helmet |

| A03:2021 Injection | SQL/command/code injection | SAST security rules and dependency scanning | Semgrep + SonarQube for IDE + Trivy |

| A04:2021 Insecure Design | Unsafe application design | Hardened application and security gates | Code review + CI security gates |

| A05:2021 Security Misconfiguration | Insecure configuration | Helmet, disabled X-Powered-By, container hardening | ESLint security + DAST + Docker scan |

| A06:2021 Vulnerable and Outdated Components | Vulnerable dependencies | Software Composition Analysis | Trivy filesystem scan |

| A07:2021 Identification and Authentication Failures | Weak authentication | Security analysis and DAST | Semgrep + OWASP ZAP |

| A08:2021 Software and Data Integrity Failures | Tampering / untrusted components | Dependency and image scanning | Trivy + Docker image scan |

| A09:2021 Security Logging and Monitoring Failures | Insufficient detection | CI security reports and artifacts | GitHub Actions reports |

| A10:2021 Server-Side Request Forgery | SSRF | SAST and DAST security analysis | Semgrep + OWASP ZAP |



\---



## OWASP ASVS Mapping



| ASVS Area | Control | Project Implementation |

|---|---|---|

| V1 Architecture | Secure application architecture | Hardened Express application |

| V2 Authentication | Authentication security | Security analysis through SAST/DAST |

| V3 Session Management | Secure session handling | DAST security verification |

| V4 Access Control | Authorization controls | SAST/DAST analysis |

| V5 Validation, Sanitization and Encoding | Input validation | Express JSON body limit + SAST |

| V6 Stored Cryptography | Protection of sensitive data | Secret scanning |

| V7 Error Handling and Logging | Secure error handling | Application and CI logs |

| V8 Data Protection | Protection of sensitive information | Gitleaks secret scanning |

| V9 Communications | Secure communication | Helmet security headers + DAST |

| V10 Malicious Code | Prevention of malicious code | Semgrep + SonarQube for IDE + ESLint security |

| V11 Business Logic | Business logic security | SAST/DAST testing |

| V12 Files and Resources | Resource handling | Dependency and container scanning |

| V13 API and Web Service | API security | OWASP ZAP DAST |

| V14 Configuration | Secure configuration | Docker hardening + Helmet |



\---



## Security Gates



The CI/CD pipeline applies blocking quality gates.



### Secrets



Gitleaks scans the repository for accidentally committed credentials and secrets.



\*\*Gate:\*\* Critical secret findings block the pipeline.



### SAST



Semgrep analyzes the hardened application using OWASP Top 10 security rules.



\*\*Gate:\*\* Blocking SAST findings cause the pipeline to fail.



This was explicitly verified using an intentionally vulnerable `eval()` example. The GitHub Actions SAST job detected the vulnerability and failed the quality gate.



### SCA



Trivy scans application dependencies for known vulnerabilities.



\*\*Gate:\*\* HIGH and CRITICAL vulnerabilities block the pipeline.



### Docker Image Security



Trivy scans the final Docker image.



\*\*Gate:\*\* HIGH and CRITICAL vulnerabilities block the pipeline.



### DAST



OWASP ZAP performs dynamic security testing against the running application.



\*\*Gate:\*\* Security failures can block the pipeline while informational warnings do not.



\---



## Shift-Left Controls



Security is also performed before CI/CD:



1\. \*\*Pre-commit\*\*

&#x20;  - Gitleaks

&#x20;  - Semgrep

&#x20;  - ESLint security



2\. \*\*IDE\*\*

&#x20;  - SonarQube for IDE



3\. \*\*CI/CD\*\*

&#x20;  - Secret scanning

&#x20;  - SAST

&#x20;  - SCA

&#x20;  - Docker image scanning

&#x20;  - DAST



This provides multiple security layers from developer workstation to CI/CD.



\---



## Security Verification Example



SonarQube for IDE was tested against intentionally vulnerable code:



```javascript

const query = req.query.code;

eval(query);


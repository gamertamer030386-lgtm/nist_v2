// src/lib/recommendations/templates.ts
// Industry-standard recommendations mapped to NIST CSF 2.0 subcategories

export type ControlCategory = "PEOPLE" | "TOOLS" | "PROCESS" | "PARTNERS";

export interface RecommendationTemplate {
  pattern: string;
  functionId: string;
  category: ControlCategory;
  description: string;
  effortLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReduction: number;
}

/**
 * NIST CSF 2.0 function names
 */
export const FUNCTION_NAMES: Record<string, string> = {
  GV: "Govern",
  ID: "Identify",
  PR: "Protect",
  DE: "Detect",
  RS: "Respond",
  RC: "Recover",
};

/**
 * Industry-standard recommendations for each NIST CSF 2.0 subcategory pattern.
 * Multiple recommendations per pattern cover People, Tools, Process, and Partners dimensions.
 */
export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERN (GV) — Organizational Context
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "GV.OC", functionId: "GV", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Develop and maintain a documented cybersecurity mission statement aligned with business objectives. Conduct annual reviews with executive leadership to ensure cybersecurity strategy supports organizational mission." },
  { pattern: "GV.OC", functionId: "GV", category: "PEOPLE", effortLevel: "LOW", riskReduction: 2,
    description: "Appoint a Chief Information Security Officer (CISO) or equivalent role responsible for communicating cybersecurity risk context to all stakeholders and ensuring alignment with business strategy." },

  // Risk Management Strategy
  { pattern: "GV.RM", functionId: "GV", category: "PROCESS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement a formal Enterprise Risk Management (ERM) framework (ISO 31000 or COSO ERM) that integrates cybersecurity risk with business risk. Define risk appetite statements, tolerance thresholds, and escalation criteria." },
  { pattern: "GV.RM", functionId: "GV", category: "TOOLS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Deploy a Governance, Risk, and Compliance (GRC) platform (e.g., ServiceNow GRC, RSA Archer, or OneTrust) to centralize risk registers, automate risk scoring, and track risk treatment plans." },
  { pattern: "GV.RM", functionId: "GV", category: "PEOPLE", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Establish a Risk Management Committee with cross-functional representation (IT, Legal, Finance, Operations). Conduct quarterly risk review meetings with documented minutes and action items." },

  // Roles, Responsibilities, and Authorities
  { pattern: "GV.RR", functionId: "GV", category: "PEOPLE", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Define a RACI matrix for all cybersecurity functions. Document roles and responsibilities in job descriptions, include cybersecurity KPIs in performance reviews, and ensure adequate staffing levels per NIST workforce framework (NICE)." },
  { pattern: "GV.RR", functionId: "GV", category: "PROCESS", effortLevel: "LOW", riskReduction: 3,
    description: "Establish a cybersecurity governance charter that defines authority levels, decision rights, and accountability for cybersecurity risk management across all organizational levels." },

  // Policy
  { pattern: "GV.PO", functionId: "GV", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Develop a comprehensive cybersecurity policy framework aligned with ISO 27001 Annex A controls. Include acceptable use, data classification, access control, incident response, and business continuity policies. Review and update annually." },
  { pattern: "GV.PO", functionId: "GV", category: "PEOPLE", effortLevel: "LOW", riskReduction: 2,
    description: "Implement mandatory policy acknowledgment for all employees upon hire and annually. Track compliance rates and follow up on non-acknowledgments within 30 days." },

  // Oversight
  { pattern: "GV.OV", functionId: "GV", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Establish Key Risk Indicators (KRIs) and Key Performance Indicators (KPIs) for cybersecurity. Report metrics to the Board quarterly including: patch compliance, incident response times, training completion, and risk exposure trends." },
  { pattern: "GV.OV", functionId: "GV", category: "PARTNERS", effortLevel: "HIGH", riskReduction: 4,
    description: "Engage an independent third-party to conduct annual cybersecurity program assessments (e.g., SOC 2 Type II audit, ISO 27001 certification audit) to validate control effectiveness and identify improvement areas." },

  // Supply Chain Risk Management
  { pattern: "GV.SC", functionId: "GV", category: "PROCESS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement a Third-Party Risk Management (TPRM) program with vendor tiering, due diligence questionnaires (SIG/CAIQ), contractual security requirements, and ongoing monitoring. Align with NIST SP 800-161r1." },
  { pattern: "GV.SC", functionId: "GV", category: "TOOLS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Deploy a vendor risk management platform (e.g., BitSight, SecurityScorecard, or Prevalent) for continuous third-party security posture monitoring and automated risk scoring." },
  { pattern: "GV.SC", functionId: "GV", category: "PARTNERS", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Require critical suppliers to maintain SOC 2 Type II or ISO 27001 certification. Include right-to-audit clauses and incident notification requirements (within 72 hours) in all vendor contracts." },

  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTIFY (ID) — Asset Management
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "ID.AM", functionId: "ID", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Deploy an automated asset discovery and inventory solution (e.g., Qualys CSAM, Axonius, or ServiceNow CMDB) covering hardware, software, cloud resources, and IoT/OT devices. Maintain 95%+ inventory accuracy with weekly reconciliation." },
  { pattern: "ID.AM", functionId: "ID", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Implement a data classification scheme (Public, Internal, Confidential, Restricted) with handling procedures for each level. Map data flows between systems and maintain data flow diagrams updated quarterly." },
  { pattern: "ID.AM", functionId: "ID", category: "PEOPLE", effortLevel: "LOW", riskReduction: 2,
    description: "Assign data owners and system owners for all critical assets. Require owners to review and validate asset classifications and access permissions semi-annually." },

  // Risk Assessment
  { pattern: "ID.RA", functionId: "ID", category: "PROCESS", effortLevel: "HIGH", riskReduction: 5,
    description: "Conduct formal risk assessments using NIST SP 800-30 or ISO 27005 methodology. Perform annual comprehensive assessments and event-driven assessments for significant changes. Maintain a risk register with quantified impact and likelihood scores." },
  { pattern: "ID.RA", functionId: "ID", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement continuous vulnerability management with automated scanning (Tenable, Qualys, or Rapid7). Scan all assets weekly, remediate critical vulnerabilities within 7 days, high within 30 days per SLA." },
  { pattern: "ID.RA", functionId: "ID", category: "PARTNERS", effortLevel: "HIGH", riskReduction: 4,
    description: "Engage penetration testing firms annually for external/internal network, web application, and social engineering assessments. Conduct red team exercises for critical systems every 2 years." },

  // Improvement
  { pattern: "ID.IM", functionId: "ID", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Establish a continuous improvement program with lessons learned from incidents, audit findings, and exercises. Track remediation actions in a centralized system with defined SLAs and executive reporting." },
  { pattern: "ID.IM", functionId: "ID", category: "PEOPLE", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Conduct tabletop exercises and simulations quarterly involving cross-functional teams. Document findings, assign corrective actions, and verify completion within 90 days." },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTECT (PR) — Identity Management & Access Control
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "PR.AA", functionId: "PR", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement Zero Trust Architecture with Identity Provider (IdP) integration (Okta, Azure AD, or Ping Identity). Enforce MFA for all users, implement conditional access policies, and deploy Privileged Access Management (PAM) for admin accounts." },
  { pattern: "PR.AA", functionId: "PR", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Implement quarterly access reviews for all systems. Enforce least-privilege principle, separation of duties, and automated deprovisioning within 24 hours of role change or termination. Document access control policies per NIST SP 800-53 AC controls." },
  { pattern: "PR.AA", functionId: "PR", category: "PEOPLE", effortLevel: "LOW", riskReduction: 3,
    description: "Train all users on password hygiene, phishing recognition, and MFA usage. Require privileged users to complete additional security training annually covering PAM procedures and secure administration practices." },

  // Awareness and Training
  { pattern: "PR.AT", functionId: "PR", category: "PEOPLE", effortLevel: "LOW", riskReduction: 4,
    description: "Implement a comprehensive Security Awareness Training program with monthly phishing simulations, role-based training modules, and annual refresher courses. Target <5% phishing click rate. Use platforms like KnowBe4, Proofpoint, or SANS." },
  { pattern: "PR.AT", functionId: "PR", category: "PEOPLE", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Develop specialized training tracks for developers (secure coding/OWASP), IT admins (hardening/incident response), executives (risk governance), and third-party contractors (data handling). Track completion and assess knowledge retention." },

  // Data Security
  { pattern: "PR.DS", functionId: "PR", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Deploy Data Loss Prevention (DLP) solutions across endpoints, network, and cloud (Microsoft Purview, Symantec DLP, or Forcepoint). Implement encryption at rest (AES-256) and in transit (TLS 1.3). Enable database activity monitoring for sensitive data stores." },
  { pattern: "PR.DS", functionId: "PR", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Implement a backup strategy following the 3-2-1 rule (3 copies, 2 media types, 1 offsite). Test backup restoration quarterly. Encrypt all backups and maintain immutable copies for ransomware resilience." },

  // Platform Security
  { pattern: "PR.PS", functionId: "PR", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement automated configuration management using CIS Benchmarks. Deploy endpoint protection (EDR) on all systems (CrowdStrike, SentinelOne, or Microsoft Defender). Enforce application whitelisting on critical servers." },
  { pattern: "PR.PS", functionId: "PR", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Establish a patch management program with defined SLAs: critical patches within 72 hours, high within 14 days, medium within 30 days. Automate patching where possible and maintain exception documentation for deferred patches." },
  { pattern: "PR.PS", functionId: "PR", category: "PROCESS", effortLevel: "HIGH", riskReduction: 4,
    description: "Implement a Secure Software Development Lifecycle (SSDLC) with threat modeling, static/dynamic code analysis (SAST/DAST), dependency scanning, and security gates at each development phase. Align with NIST SSDF (SP 800-218)." },

  // Technology Infrastructure Resilience
  { pattern: "PR.IR", functionId: "PR", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement network segmentation with micro-segmentation for critical assets. Deploy next-generation firewalls, Web Application Firewalls (WAF), and DDoS protection. Design redundant architecture with failover capabilities meeting defined RTO/RPO." },
  { pattern: "PR.IR", functionId: "PR", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Develop and test Business Continuity and Disaster Recovery (BC/DR) plans annually. Define Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for all critical systems. Conduct failover tests semi-annually." },

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECT (DE) — Continuous Monitoring
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "DE.CM", functionId: "DE", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Deploy a Security Information and Event Management (SIEM) platform (Splunk, Microsoft Sentinel, or Elastic Security) with 24/7 monitoring. Implement UEBA for anomaly detection, network traffic analysis (NTA), and cloud security monitoring (CASB)." },
  { pattern: "DE.CM", functionId: "DE", category: "PEOPLE", effortLevel: "HIGH", riskReduction: 4,
    description: "Establish a Security Operations Center (SOC) with 24/7 coverage — either in-house or via Managed Detection and Response (MDR) provider. Define detection use cases, alert triage procedures, and escalation paths." },
  { pattern: "DE.CM", functionId: "DE", category: "PARTNERS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Subscribe to threat intelligence feeds (MITRE ATT&CK, ISACs, commercial feeds) and integrate with SIEM for enhanced detection. Engage a Managed Security Service Provider (MSSP) if internal SOC capacity is insufficient." },

  // Adverse Event Analysis
  { pattern: "DE.AE", functionId: "DE", category: "TOOLS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Implement automated alert correlation and enrichment using SOAR platforms (Palo Alto XSOAR, Splunk SOAR, or Swimlane). Define playbooks for common alert types to reduce mean time to detect (MTTD) below 24 hours." },
  { pattern: "DE.AE", functionId: "DE", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Develop and maintain detection rules aligned with MITRE ATT&CK framework. Conduct purple team exercises quarterly to validate detection coverage. Track detection coverage metrics and address gaps systematically." },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESPOND (RS) — Incident Management
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "RS.MA", functionId: "RS", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 5,
    description: "Develop a comprehensive Incident Response Plan aligned with NIST SP 800-61r2. Define incident severity levels, escalation procedures, communication templates, and roles/responsibilities. Test the plan through tabletop exercises quarterly." },
  { pattern: "RS.MA", functionId: "RS", category: "PARTNERS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Establish retainer agreements with incident response firms (e.g., CrowdStrike Services, Mandiant, or Secureworks) for surge capacity during major incidents. Pre-negotiate SLAs for response time (4-hour for critical incidents)." },

  // Incident Analysis
  { pattern: "RS.AN", functionId: "RS", category: "TOOLS", effortLevel: "HIGH", riskReduction: 4,
    description: "Deploy digital forensics and incident response (DFIR) tooling including forensic imaging capabilities, memory analysis tools, and log aggregation. Maintain chain-of-custody procedures for evidence preservation." },
  { pattern: "RS.AN", functionId: "RS", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Implement root cause analysis (RCA) procedures for all significant incidents. Document findings in post-incident reports within 14 days. Track remediation actions to completion and verify effectiveness." },

  // Incident Response Reporting and Communication
  { pattern: "RS.CO", functionId: "RS", category: "PROCESS", effortLevel: "LOW", riskReduction: 3,
    description: "Develop incident communication plans with pre-approved templates for internal stakeholders, customers, regulators, and media. Define notification timelines aligned with regulatory requirements (GDPR 72-hour, SEC 4-day)." },
  { pattern: "RS.CO", functionId: "RS", category: "PEOPLE", effortLevel: "LOW", riskReduction: 2,
    description: "Train designated spokespersons on crisis communication. Conduct annual media training for executives. Establish secure out-of-band communication channels for use during incidents." },

  // Incident Mitigation
  { pattern: "RS.MI", functionId: "RS", category: "TOOLS", effortLevel: "HIGH", riskReduction: 5,
    description: "Implement automated containment capabilities: network isolation (NAC), endpoint quarantine (EDR), account lockout (IdP), and DNS sinkholing. Define automated response playbooks for common attack patterns (ransomware, BEC, data exfiltration)." },
  { pattern: "RS.MI", functionId: "RS", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 4,
    description: "Define containment strategies for each incident type (isolate, throttle, block, redirect). Document eradication procedures including malware removal, credential reset, and system rebuild processes." },

  // ═══════════════════════════════════════════════════════════════════════════
  // RECOVER (RC) — Incident Recovery Plan Execution
  // ═══════════════════════════════════════════════════════════════════════════
  { pattern: "RC.RP", functionId: "RC", category: "PROCESS", effortLevel: "HIGH", riskReduction: 5,
    description: "Develop detailed recovery playbooks for each critical system with step-by-step restoration procedures, validation checks, and rollback criteria. Define recovery priorities based on Business Impact Analysis (BIA). Test recovery procedures semi-annually." },
  { pattern: "RC.RP", functionId: "RC", category: "TOOLS", effortLevel: "HIGH", riskReduction: 4,
    description: "Implement immutable backup solutions with air-gapped or cloud-isolated copies. Deploy automated disaster recovery orchestration (Zerto, Veeam, or AWS Elastic Disaster Recovery) with tested failover capabilities meeting defined RTO/RPO." },

  // Incident Recovery Communication
  { pattern: "RC.CO", functionId: "RC", category: "PROCESS", effortLevel: "MEDIUM", riskReduction: 3,
    description: "Establish recovery communication protocols with status update cadences (hourly during active recovery, daily during stabilization). Define stakeholder notification matrices and maintain updated contact lists for all critical parties." },
  { pattern: "RC.CO", functionId: "RC", category: "PARTNERS", effortLevel: "LOW", riskReduction: 2,
    description: "Pre-establish relationships with crisis communication firms, legal counsel specializing in data breach, and cyber insurance carriers. Ensure contact information and engagement procedures are documented and accessible during incidents." },
];

/**
 * Classify a recommendation category based on subcategory context keywords.
 * Falls back to the template's default category if no keyword match is found.
 */
export function classifyCategory(
  subcategoryDescription: string,
  implementationExamples: string,
  defaultCategory: ControlCategory
): ControlCategory {
  const text = `${subcategoryDescription} ${implementationExamples}`.toLowerCase();

  const peopleKeywords = ["training", "hiring", "awareness", "roles", "skill", "personnel", "workforce", "competenc", "staff"];
  const toolsKeywords = ["technology", "software", "monitoring", "automation", "tool", "system", "platform", "solution", "deploy"];
  const processKeywords = ["polic", "procedure", "workflow", "documentation", "process", "plan", "standard", "guideline"];
  const partnersKeywords = ["third-party", "consultant", "managed service", "vendor", "supplier", "external", "outsourc", "partner"];

  const scores: Record<ControlCategory, number> = {
    PEOPLE: peopleKeywords.filter((kw) => text.includes(kw)).length,
    TOOLS: toolsKeywords.filter((kw) => text.includes(kw)).length,
    PROCESS: processKeywords.filter((kw) => text.includes(kw)).length,
    PARTNERS: partnersKeywords.filter((kw) => text.includes(kw)).length,
  };

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return defaultCategory;

  const entries = Object.entries(scores) as [ControlCategory, number][];
  const best = entries.find(([, score]) => score === maxScore);
  return best ? best[0] : defaultCategory;
}

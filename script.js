const START_MINUTE = 8 * 60;
const SHIFT_END_MINUTE = 12 * 60;

const priorities = ["P1", "P2", "P3", "P4"];

const diagnosisOptions = [
  { id: "social_engineering", label: "Social engineering" },
  { id: "app_update_failure", label: "Broken app update" },
  { id: "identity_outage", label: "Identity outage" },
  { id: "unauthorized_access", label: "Unauthorized access" },
  { id: "av_hardware", label: "Room or hardware fault" },
  { id: "endpoint_malware", label: "Endpoint compromise" },
  { id: "mailbox_compromise", label: "Mailbox compromise" },
  { id: "asset_custody", label: "Asset custody issue" }
];

const categoryOptions = [
  { id: "security", label: "Security" },
  { id: "access", label: "Access" },
  { id: "apps", label: "Business Apps" },
  { id: "network", label: "Network" },
  { id: "hardware", label: "Hardware" },
  { id: "asset", label: "Asset / Onboarding" }
];

const troubleshootingOptions = [
  { id: "callback_verify", label: "Callback verification", cost: 3 },
  { id: "isolate_endpoint", label: "Isolate endpoint", cost: 4 },
  { id: "rollback_update", label: "Rollback bad update", cost: 6 },
  { id: "status_broadcast", label: "Post status banner", cost: 4 },
  { id: "revoke_rule", label: "Remove risky rule", cost: 5 },
  { id: "replace_hardware", label: "Swap failed hardware", cost: 7 },
  { id: "custody_transfer", label: "Transfer asset custody", cost: 4 },
  { id: "request_approval", label: "Request approval trail", cost: 4 },
  { id: "document_notes", label: "Document case notes", cost: 3 }
];

const resolutionOptions = [
  { id: "remote_fix", label: "Remote Fix", cost: 8, resource: null, note: "Troubleshoot and resolve yourself." },
  { id: "reset_access", label: "Reset Access", cost: 6, resource: null, note: "Password, MFA, or permission change." },
  { id: "security", label: "Escalate Security", cost: 5, resource: "security", note: "Contain or investigate risk." },
  { id: "network", label: "Escalate Network", cost: 5, resource: "network", note: "Route infrastructure incidents." },
  { id: "apps", label: "Escalate Apps", cost: 5, resource: "apps", note: "Route SaaS or business app issues." },
  { id: "dispatch", label: "Dispatch Tech", cost: 10, resource: "field", note: "Send limited on-site help." },
  { id: "deny", label: "Deny Request", cost: 4, resource: null, note: "Refuse unsafe or unauthorized work." },
  { id: "monitor", label: "Monitor", cost: 4, resource: null, note: "Park it and watch for correlation." }
];

const investigationActions = [
  { id: "verify", label: "Verify Identity", symbol: "ID", cost: 4, description: "Check caller, directory, MFA, manager, and policy." },
  { id: "question", label: "Ask Follow-up", symbol: "?", cost: 5, description: "Gather symptom details and pressure cues." },
  { id: "diagnostics", label: "Run Diagnostics", symbol: ">>", cost: 6, description: "Query logs, device health, alerts, and service status." },
  { id: "records", label: "Check Records", symbol: "#", cost: 4, description: "Review asset, access, location, and prior tickets." }
];

const channelStatus = [
  { id: "Phone", label: "Phones" },
  { id: "Chat", label: "Chat" },
  { id: "Ticket", label: "Tickets" },
  { id: "Monitoring", label: "Alerts" },
  { id: "Walk-up", label: "Walk-ups" }
];

const cases = [
  {
    id: "exec-mfa",
    arrival: 8 * 60 + 3,
    channel: "Phone",
    title: "CEO office MFA bypass",
    requester: "Mira Vale",
    department: "Executive Office",
    location: "External phone number",
    signals: ["External caller", "VIP pressure", "Security risk"],
    risk: { security: "High", impact: "Executive access", verification: "Failed", sla: "Rising" },
    report: "Caller says the CEO is locked out before an acquisition call and demands an MFA bypass right now.",
    facts: {
      Asset: "No managed device presented",
      Account: "mvale-exec-alias",
      Pressure: "Caller repeatedly asks you to skip the ticket process"
    },
    evidence: [
      { source: "Initial report", text: "Caller knows the CEO's travel city but cannot answer the callback phrase.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "Mira Vale's verified number ends in 0142. This call came from 9017. The CEO office has no emergency bypass exception.", tone: "risk" },
      question: { source: "Follow-up", text: "When asked for employee ID, caller gives the CEO's public-facing email alias instead.", tone: "risk" },
      diagnostics: { source: "Identity logs", text: "Five failed MFA prompts came from a new country in the last 20 minutes.", tone: "risk" },
      records: { source: "Policy record", text: "Today's rule: executive MFA resets require callback verification and security approval.", tone: "good" }
    },
    correctPriority: "P2",
    correctDiagnosis: "social_engineering",
    correctCategory: "security",
    correctTroubleshooting: ["callback_verify"],
    correctResolution: "security",
    acceptAlso: ["deny"],
    securityRisk: true,
    consequence: {
      good: "Security confirms a targeted social-engineering attempt and blocks the source number.",
      bad: "A privileged mailbox was accessed after the bypass. Legal asks why verification was skipped."
    }
  },
  {
    id: "warehouse-scanners",
    arrival: 8 * 60 + 11,
    channel: "Ticket",
    title: "Warehouse scanners all frozen",
    requester: "Nolan Reed",
    department: "Shipping",
    location: "Warehouse B",
    signals: ["Multi-user impact", "Operations blocked", "Dispatch candidate"],
    risk: { security: "Low", impact: "Warehouse outage", verification: "Trusted source", sla: "Critical" },
    report: "Ten handheld scanners froze after the morning update. Trucks are waiting at the dock.",
    facts: {
      Asset: "Scanner pool WH-B",
      Account: "shipping-kiosk",
      Business: "Outbound shipments stopped"
    },
    evidence: [
      { source: "Initial report", text: "Multiple devices with the same update time fail at login.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "Requester is the shipping lead on duty and submitted from a managed floor terminal.", tone: "good" },
      question: { source: "Follow-up", text: "Rebooting one scanner gets to the login screen, then the inventory app crashes.", tone: "risk" },
      diagnostics: { source: "Device logs", text: "Inventory client version 7.4.2 crashes on the WH-B device group only.", tone: "risk" },
      records: { source: "Change calendar", text: "Field techs have a rollback package for warehouse devices, but only two dispatches remain today.", tone: "good" }
    },
    correctPriority: "P1",
    correctDiagnosis: "app_update_failure",
    correctCategory: "apps",
    correctTroubleshooting: ["rollback_update"],
    correctResolution: "dispatch",
    acceptAlso: ["apps"],
    securityRisk: false,
    consequence: {
      good: "Shipping recovers before the late carrier cutoff. Operations thanks the desk for treating it like a production incident.",
      bad: "The dock missed the carrier window. Finance logs expedited freight charges against IT."
    }
  },
  {
    id: "vpn-wave",
    arrival: 8 * 60 + 28,
    channel: "Monitoring",
    title: "VPN failures spike",
    requester: "Edge monitor",
    department: "Infrastructure",
    location: "Remote workforce",
    signals: ["Monitoring alert", "Multi-region", "Call flood risk"],
    risk: { security: "Medium", impact: "Remote workforce", verification: "Trusted monitor", sla: "Critical" },
    report: "VPN authentication failures jumped across three regions. Individual users are starting to call in.",
    facts: {
      Asset: "VPN concentrators",
      Account: "SAML identity path",
      Pattern: "Regional but not tied to one ISP"
    },
    evidence: [
      { source: "Monitoring", text: "Failure rate rose from 2 percent to 41 percent in eight minutes.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Source validation", text: "The alert is from a trusted monitor and matches incoming user reports.", tone: "good" },
      question: { source: "Caller sample", text: "Affected users can reach the internet but get looped back to sign-in.", tone: "risk" },
      diagnostics: { source: "Service status", text: "Identity provider token signing latency is degraded. VPN appliances are healthy.", tone: "risk" },
      records: { source: "Runbook", text: "Mass remote access failure is P1 when more than one region is affected.", tone: "good" }
    },
    correctPriority: "P1",
    correctDiagnosis: "identity_outage",
    correctCategory: "network",
    correctTroubleshooting: ["status_broadcast"],
    correctResolution: "apps",
    acceptAlso: ["network", "monitor"],
    securityRisk: false,
    consequence: {
      good: "Apps posts an outage banner and the call flood slows after a clear status message.",
      bad: "The desk keeps resetting passwords one at a time while the real outage burns through the morning."
    }
  },
  {
    id: "payroll-access",
    arrival: 8 * 60 + 47,
    channel: "Walk-up",
    title: "Contractor wants payroll share",
    requester: "Jules Tan",
    department: "Finance contractor",
    location: "12th floor help counter",
    signals: ["Walk-up", "Restricted data", "Unmanaged device"],
    risk: { security: "High", impact: "Payroll data", verification: "Unverified", sla: "Low" },
    report: "Contractor says their manager is in a board meeting and asked them to pull a payroll export from a restricted share.",
    facts: {
      Asset: "Personal laptop at counter",
      Account: "jtan-temp",
      Request: "Add payroll read access"
    },
    evidence: [
      { source: "Initial report", text: "Requester is polite but has no written approval and is using an unmanaged device.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Manager check", text: "Manager is on PTO today. Finance access requests require a ticket from the approver group.", tone: "risk" },
      question: { source: "Follow-up", text: "Requester says 'I only need one file' but cannot name the report owner.", tone: "risk" },
      diagnostics: { source: "Access logs", text: "The temp account has never accessed payroll systems before.", tone: "risk" },
      records: { source: "Data policy", text: "Payroll data is restricted. No counter approvals and no personal devices.", tone: "good" }
    },
    correctPriority: "P3",
    correctDiagnosis: "unauthorized_access",
    correctCategory: "access",
    correctTroubleshooting: ["request_approval"],
    correctResolution: "deny",
    acceptAlso: ["security"],
    securityRisk: true,
    consequence: {
      good: "Finance confirms the request was not authorized and asks you to document the interaction.",
      bad: "An export lands on an unmanaged laptop. HR opens an incident review."
    }
  },
  {
    id: "projector-demo",
    arrival: 9 * 60 + 8,
    channel: "Chat",
    title: "Boardroom projector dead",
    requester: "Ari Gomez",
    department: "Sales",
    location: "Boardroom 4A",
    signals: ["Revenue impact", "Time pressure", "Dispatch candidate"],
    risk: { security: "Low", impact: "Customer demo", verification: "Likely valid", sla: "Rising" },
    report: "A customer demo starts in 25 minutes. The room display shows no signal from any laptop.",
    facts: {
      Asset: "Boardroom 4A AV kit",
      Account: "agomez",
      Pressure: "Revenue meeting"
    },
    evidence: [
      { source: "Initial report", text: "Two users tried different laptops and cables with the same result.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "Requester is a sales director assigned to the room booking.", tone: "good" },
      question: { source: "Follow-up", text: "The room tablet can change volume but cannot switch input.", tone: "risk" },
      diagnostics: { source: "AV controller", text: "Controller is online, but HDMI matrix port 3 is faulted.", tone: "risk" },
      records: { source: "Room history", text: "Same matrix failed twice this quarter. Field tech replacement stock is nearby.", tone: "good" }
    },
    correctPriority: "P2",
    correctDiagnosis: "av_hardware",
    correctCategory: "hardware",
    correctTroubleshooting: ["replace_hardware"],
    correctResolution: "dispatch",
    acceptAlso: ["remote_fix"],
    securityRisk: false,
    consequence: {
      good: "A tech swaps the matrix input before the customer arrives. Sales sends a rare nice note.",
      bad: "The demo starts late and the account team books a follow-up with an annoyed customer."
    }
  },
  {
    id: "invoice-popups",
    arrival: 9 * 60 + 22,
    channel: "Phone",
    title: "Invoice opened, popups started",
    requester: "Leah Ortiz",
    department: "Accounts Payable",
    location: "HQ 8W",
    signals: ["Security risk", "Payment access", "Endpoint alert"],
    risk: { security: "High", impact: "Payment workflow", verification: "Verified caller", sla: "Critical" },
    report: "User opened an invoice attachment from a new vendor. Browser popups and a fake antivirus page appeared.",
    facts: {
      Asset: "AP-LAP-184",
      Account: "lortiz",
      Data: "Vendor payment queue"
    },
    evidence: [
      { source: "Initial report", text: "User is still connected to the network and has payment approval access.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "Caller passed callback verification and is the assigned owner of AP-LAP-184.", tone: "good" },
      question: { source: "Follow-up", text: "The attachment was a password-protected zip from outside the company.", tone: "risk" },
      diagnostics: { source: "Endpoint alert", text: "EDR flags a suspicious PowerShell child process from the unzip folder.", tone: "risk" },
      records: { source: "Security runbook", text: "Payment-system laptops with suspected malware require immediate containment.", tone: "good" }
    },
    correctPriority: "P1",
    correctDiagnosis: "endpoint_malware",
    correctCategory: "security",
    correctTroubleshooting: ["isolate_endpoint"],
    correctResolution: "security",
    acceptAlso: ["dispatch"],
    securityRisk: true,
    consequence: {
      good: "Security isolates the laptop and catches two more recipients before they open the same invoice.",
      bad: "A fraudulent vendor change request is approved before the endpoint is contained."
    }
  },
  {
    id: "shared-mailbox",
    arrival: 9 * 60 + 41,
    channel: "Ticket",
    title: "Support mailbox missing messages",
    requester: "Priya Shah",
    department: "Customer Care",
    location: "Remote",
    signals: ["Security risk", "Business critical", "External forwarding"],
    risk: { security: "High", impact: "Customer refunds", verification: "Portal request", sla: "Critical" },
    report: "Messages disappear from the shared support mailbox minutes after arrival.",
    facts: {
      Asset: "support@ mailbox",
      Account: "shared mailbox delegates",
      Pattern: "Only messages with refund keywords vanish"
    },
    evidence: [
      { source: "Initial report", text: "The mailbox is business critical but only certain messages are affected.", tone: "risk" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "Requester is the mailbox owner and submitted through the service portal.", tone: "good" },
      question: { source: "Follow-up", text: "Missing messages are not in deleted items. One customer forwarded a copy with a refund keyword.", tone: "risk" },
      diagnostics: { source: "Mailbox audit", text: "A new inbox rule forwards refund emails to an external address, then hides them.", tone: "risk" },
      records: { source: "Prior ticket", text: "A delegate had an MFA fatigue report yesterday and has not changed their password.", tone: "risk" }
    },
    correctPriority: "P1",
    correctDiagnosis: "mailbox_compromise",
    correctCategory: "security",
    correctTroubleshooting: ["revoke_rule"],
    correctResolution: "security",
    acceptAlso: ["apps"],
    securityRisk: true,
    consequence: {
      good: "Security disables the malicious rule and starts delegate credential resets before refunds are abused.",
      bad: "Refund messages continue forwarding externally. Customer Care reports account-takeover fraud."
    }
  },
  {
    id: "new-hire-laptop",
    arrival: 10 * 60 + 5,
    channel: "Ticket",
    title: "New hire laptop not ready",
    requester: "Evan Brooks",
    department: "People Ops",
    location: "HQ lobby",
    signals: ["Onboarding", "Asset custody", "Time pressure"],
    risk: { security: "Medium", impact: "New hire start", verification: "Trusted source", sla: "Rising" },
    report: "A new engineer starts in one hour. The assigned laptop is still in imaging and People Ops wants any spare handed over.",
    facts: {
      Asset: "ENG-LAP-302",
      Account: "new hire pending",
      Pressure: "Onboarding starts soon"
    },
    evidence: [
      { source: "Initial report", text: "The spare laptop request is legitimate, but asset custody still matters.", tone: "good" }
    ],
    reveals: {
      verify: { source: "Directory check", text: "People Ops requester is assigned to today's onboarding roster.", tone: "good" },
      question: { source: "Follow-up", text: "The new hire needs email, SSO, and engineering docs, not admin rights.", tone: "good" },
      diagnostics: { source: "Imaging status", text: "ENG-LAP-302 will finish in 70 minutes. A clean spare is ready in the depot.", tone: "good" },
      records: { source: "Asset record", text: "Spare ENG-LAP-118 can be issued if custody is transferred before handoff.", tone: "good" }
    },
    correctPriority: "P3",
    correctDiagnosis: "asset_custody",
    correctCategory: "asset",
    correctTroubleshooting: ["custody_transfer"],
    correctResolution: "dispatch",
    acceptAlso: ["remote_fix"],
    securityRisk: false,
    consequence: {
      good: "The new hire starts on time with a tracked spare and no admin-rights shortcut.",
      bad: "A laptop is handed over without custody transfer. Asset management flags the desk."
    }
  }
];

const rules = [
  { minute: START_MINUTE, text: "No MFA bypass or password reset without callback verification." },
  { minute: START_MINUTE, text: "P1 means security exposure, production outage, or multi-user revenue/operations impact." },
  { minute: START_MINUTE, text: "Payroll and finance data access requires an approver-group ticket. Walk-up approval is invalid." },
  { minute: 9 * 60 + 15, text: "Security bulletin: executive office and finance are under targeted social-engineering attempts." },
  { minute: 9 * 60 + 35, text: "Correlate same-symptom reports before resetting individual accounts." }
];

const initialState = {
  time: START_MINUTE,
  selectedId: null,
  selectedDiagnosis: null,
  selectedCategory: null,
  selectedPriority: null,
  selectedTroubleshooting: [],
  resources: {
    security: { label: "Security analysts", remaining: 3, max: 3 },
    field: { label: "Field tech dispatches", remaining: 3, max: 3 },
    network: { label: "Network engineers", remaining: 2, max: 2 },
    apps: { label: "Apps engineers", remaining: 2, max: 2 }
  },
  metrics: {
    trust: 72,
    security: 72,
    sla: 72,
    budget: 72
  },
  feed: [
    { minute: START_MINUTE, title: "Desk ready", text: "Start the shift to receive calls, tickets, chats, monitoring alerts, and walk-ups.", tone: "neutral" }
  ],
  scheduled: [],
  reviews: [],
  cases: cases.map((item) => ({
    ...item,
    status: "pending",
    revealed: ["initial"],
    audit: [
      { minute: item.arrival, title: "Ticket opened", text: `${item.channel} from ${item.requester}` }
    ],
    diagnosis: null,
    category: null,
    priority: null,
    troubleshooting: [],
    resolution: null,
    score: null,
    quality: null,
    severity: null
  }))
};

let state = cloneState(initialState);

const els = {
  clock: document.querySelector("#clock"),
  queueCount: document.querySelector("#queueCount"),
  openCount: document.querySelector("#openCount"),
  queueList: document.querySelector("#queueList"),
  resourceList: document.querySelector("#resourceList"),
  metricList: document.querySelector("#metricList"),
  feed: document.querySelector("#feed"),
  caseTitle: document.querySelector("#caseTitle"),
  caseSignals: document.querySelector("#caseSignals"),
  caseStatus: document.querySelector("#caseStatus"),
  stageTitle: document.querySelector("#stageTitle"),
  stageHint: document.querySelector("#stageHint"),
  stageMissing: document.querySelector("#stageMissing"),
  evidenceProgress: document.querySelector("#evidenceProgress"),
  requirementStatus: document.querySelector("#requirementStatus"),
  nextActionTitle: document.querySelector("#nextActionTitle"),
  nextActionHint: document.querySelector("#nextActionHint"),
  nextActionButton: document.querySelector("#nextActionButton"),
  channelStatus: document.querySelector("#channelStatus"),
  reportPanel: document.querySelector("#reportPanel"),
  evidencePanel: document.querySelector("#evidencePanel"),
  classificationPanel: document.querySelector("#classificationPanel"),
  rulesPanel: document.querySelector("#rulesPanel"),
  actionsPanel: document.querySelector("#actionsPanel"),
  decisionPanel: document.querySelector("#decisionPanel"),
  troubleshootSection: document.querySelector("#troubleshootSection"),
  resolutionSection: document.querySelector("#resolutionSection"),
  caseFacts: document.querySelector("#caseFacts"),
  evidenceLog: document.querySelector("#evidenceLog"),
  riskLens: document.querySelector("#riskLens"),
  rulesList: document.querySelector("#rulesList"),
  workflowSteps: document.querySelector("#workflowSteps"),
  workflowHint: document.querySelector("#workflowHint"),
  investigationActions: document.querySelector("#investigationActions"),
  priorityControl: document.querySelector("#priorityControl"),
  diagnosisControl: document.querySelector("#diagnosisControl"),
  categoryControl: document.querySelector("#categoryControl"),
  troubleshootControl: document.querySelector("#troubleshootControl"),
  resolutionGrid: document.querySelector("#resolutionGrid"),
  actionHint: document.querySelector("#actionHint"),
  troubleshootHelper: document.querySelector("#troubleshootHelper"),
  resolutionHelper: document.querySelector("#resolutionHelper"),
  advanceTime: document.querySelector("#advanceTime"),
  endShift: document.querySelector("#endShift"),
  summaryModal: document.querySelector("#summaryModal"),
  summaryBody: document.querySelector("#summaryBody"),
  restartGame: document.querySelector("#restartGame"),
  closeReviewModal: document.querySelector("#closeReviewModal"),
  closeReviewTitle: document.querySelector("#closeReviewTitle"),
  closeReviewBadge: document.querySelector("#closeReviewBadge"),
  closeReviewBody: document.querySelector("#closeReviewBody"),
  ackCloseReview: document.querySelector("#ackCloseReview")
};

function cloneState(source) {
  return JSON.parse(JSON.stringify(source));
}

function formatTime(minute) {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function labelFor(options, id) {
  return options.find((item) => item.id === id)?.label || "Unclassified";
}

function evidenceCount(item) {
  return item ? item.evidence.length + Math.max(0, item.revealed.length - 1) : 0;
}

function evidenceTotal(item) {
  return item ? item.evidence.length + Object.keys(item.reveals).length : 0;
}

function requirementItems(item) {
  return [
    { id: "verify", label: "Identity", done: Boolean(item && item.revealed.includes("verify")) },
    { id: "diagnosis", label: "Diagnosis", done: Boolean(item && item.diagnosis) },
    { id: "category", label: "Category", done: Boolean(item && item.category) },
    { id: "priority", label: "Priority", done: Boolean(item && item.priority) },
    { id: "troubleshooting", label: "Troubleshooting", done: Boolean(item && item.troubleshooting.length) }
  ];
}

function stageLabel(item) {
  return currentStage(item).title;
}

function signalTags(item) {
  if (!item) return [];
  const tags = [...(item.signals || [])];
  if (item.isFollowUp && !tags.includes("Follow-up")) {
    tags.unshift("Follow-up");
  }
  if (item.quality && !tags.includes(item.quality)) {
    tags.push(item.quality);
  }
  if (item.severity && !tags.includes(`${item.severity} severity`)) {
    tags.push(`${item.severity} severity`);
  }
  return tags;
}

function activeRules() {
  return rules.filter((rule) => rule.minute <= state.time);
}

function availableCases() {
  return state.cases.filter((item) => item.arrival <= state.time);
}

function futureCases() {
  return state.cases.filter((item) => item.arrival > state.time);
}

function openCases() {
  return availableCases().filter((item) => item.status !== "resolved");
}

function selectedCase() {
  return state.cases.find((item) => item.id === state.selectedId) || null;
}

function addFeed(title, text, tone = "neutral", minute = state.time, severity = null) {
  state.feed.unshift({ title, text, tone, minute, severity });
}

function clampMetric(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function changeMetric(name, amount) {
  state.metrics[name] = clampMetric(state.metrics[name] + amount);
}

function addAudit(caseItem, title, text, minute = state.time) {
  if (!caseItem) return;
  caseItem.audit.unshift({ minute, title, text });
}

function chosenTroubleshootingLabels(caseItem) {
  return caseItem.troubleshooting.length
    ? caseItem.troubleshooting.map((step) => labelFor(troubleshootingOptions, step)).join(", ")
    : "None";
}

function chosenResolutionLabel(caseItem) {
  return labelFor(resolutionOptions, caseItem.resolution);
}

function advance(minutes) {
  state.time += minutes;
  unlockArrivals();
  processScheduled();
  render();
}

function unlockArrivals() {
  state.cases.forEach((item) => {
    if (item.arrival <= state.time && item.status === "pending") {
      item.status = "new";
      addFeed("New " + item.channel.toLowerCase(), item.title, "neutral", item.arrival);
      if (!state.selectedId) {
        state.selectedId = item.id;
        syncSelectionFromCase(item);
      }
    }
  });
}

function processScheduled() {
  const due = state.scheduled.filter((item) => item.minute <= state.time);
  state.scheduled = state.scheduled.filter((item) => item.minute > state.time);
  due.forEach((item) => {
    if (item.followUp) {
      const hadOpenWork = openCases().length > 0;
      state.cases.push(item.followUp);
      item.followUp.status = "new";
      if (!hadOpenWork || !state.selectedId) {
        state.selectedId = item.followUp.id;
        syncSelectionFromCase(item.followUp);
      }
    }
    addFeed(item.title, item.text, item.tone, item.minute, item.severity || null);
    Object.entries(item.metricChanges || {}).forEach(([metric, amount]) => changeMetric(metric, amount));
  });
}

function syncSelectionFromCase(caseItem) {
  state.selectedDiagnosis = caseItem ? caseItem.diagnosis : null;
  state.selectedCategory = caseItem ? caseItem.category : null;
  state.selectedPriority = caseItem ? caseItem.priority : null;
  state.selectedTroubleshooting = caseItem ? [...caseItem.troubleshooting] : [];
}

function currentStage(item) {
  if (!item) {
    return {
      id: "start",
      title: "Start Shift",
      hint: "Start the shift to receive calls, tickets, chats, alerts, and walk-ups.",
      missing: ["Start shift"]
    };
  }

  if (item.status === "resolved") {
    return {
      id: "follow",
      title: "Waiting For Consequences",
      hint: "This ticket is closed. Watch the supervisor feed and queue for follow-up work.",
      missing: []
    };
  }

  if (item.revealed.length === 1) {
    return {
      id: "investigate",
      title: "Gather Evidence",
      hint: "Review the report, then verify identity, ask a question, run diagnostics, or check records.",
      missing: ["Evidence"]
    };
  }

  const missing = [];
  if (!item.diagnosis) missing.push("Diagnosis");
  if (!item.category) missing.push("Category");
  if (!item.priority) missing.push("Priority");

  if (missing.length) {
    return {
      id: "classify",
      title: "Assign Category And Priority",
      hint: "Commit to what is wrong, which queue owns it, and how urgent it is.",
      missing
    };
  }

  if (!item.troubleshooting.length) {
    return {
      id: "troubleshoot",
      title: "Choose Troubleshooting Step",
      hint: "Pick the concrete action you would defend in the ticket notes. Each step spends time.",
      missing: ["Troubleshooting"]
    };
  }

  return {
    id: "close",
    title: "Choose Final Action",
    hint: "Resolve, escalate, dispatch, deny, or postpone based on the evidence and selected fix.",
    missing: ["Final action"]
  };
}

function missingClassificationTarget(item) {
  if (!item || !item.diagnosis) return "diagnosis";
  if (!item.category) return "category";
  if (!item.priority) return "priority";
  return "classification";
}

function nextActionFor(item) {
  const stage = currentStage(item);
  if (stage.id === "start") {
    return {
      title: "Start Shift",
      hint: "Open the live queue and take the first incident.",
      label: "Start Shift",
      target: "queue"
    };
  }

  if (stage.id === "investigate") {
    return {
      title: "Gather Evidence",
      hint: "Start with identity verification or diagnostics before classifying.",
      label: "Jump To Investigation",
      target: "actions"
    };
  }

  if (stage.id === "classify") {
    const missing = missingClassificationTarget(item);
    const labels = { diagnosis: "Diagnosis", category: "Category", priority: "Priority", classification: "Classification" };
    return {
      title: `Set ${labels[missing]}`,
      hint: `${stage.missing.join(", ")} still missing before troubleshooting unlocks.`,
      label: `Jump To ${labels[missing]}`,
      target: "classification"
    };
  }

  if (stage.id === "troubleshoot") {
    return {
      title: "Choose Troubleshooting",
      hint: "Pick the concrete step that addresses the likely cause.",
      label: "Jump To Troubleshooting",
      target: "troubleshoot"
    };
  }

  if (stage.id === "close") {
    return {
      title: "Close Or Escalate",
      hint: "Choose the final action you are willing to defend in review.",
      label: "Jump To Final Action",
      target: "resolution"
    };
  }

  return {
    title: "Watch For Follow-Up",
    hint: "This ticket is closed. Monitor the feed and live queue.",
    label: "Jump To Feed",
    target: "feed"
  };
}

function jumpToTarget(target) {
  const targetMap = {
    queue: els.queueList,
    actions: els.actionsPanel,
    classification: els.classificationPanel,
    troubleshoot: els.troubleshootSection,
    resolution: els.resolutionSection,
    feed: els.feed
  };
  const node = targetMap[target] || els.classificationPanel;
  if (target === "queue" && !availableCases().length && futureCases().length) {
    const nextArrival = Math.min(...futureCases().map((item) => item.arrival));
    advance(Math.max(1, nextArrival - state.time));
    return;
  }
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof node.focus === "function") {
    node.focus({ preventScroll: true });
  }
}

function reveal(caseItem, actionId) {
  if (!caseItem || caseItem.status === "resolved" || caseItem.revealed.includes(actionId)) {
    return;
  }
  caseItem.revealed.push(actionId);
  const action = investigationActions.find((item) => item.id === actionId);
  const entry = caseItem.reveals[actionId];
  const progress = `Evidence ${evidenceCount(caseItem)}/${evidenceTotal(caseItem)}`;
  addAudit(caseItem, action.label, `${entry.source}: ${entry.text}`);
  addFeed(action.label, `${caseItem.title}: ${entry.source} added. ${progress}. ${entry.text}`, entry.tone === "risk" ? "bad" : "good");
  advance(action.cost);
}

function choosePriority(priority) {
  const current = selectedCase();
  state.selectedPriority = priority;
  if (current && current.status !== "resolved") {
    current.priority = priority;
    addAudit(current, "Priority set", priority);
  }
  render();
}

function chooseDiagnosis(diagnosis) {
  const current = selectedCase();
  state.selectedDiagnosis = diagnosis;
  if (current && current.status !== "resolved") {
    current.diagnosis = diagnosis;
    addAudit(current, "Diagnosis set", labelFor(diagnosisOptions, diagnosis));
  }
  render();
}

function chooseCategory(category) {
  const current = selectedCase();
  state.selectedCategory = category;
  if (current && current.status !== "resolved") {
    current.category = category;
    addAudit(current, "Category set", labelFor(categoryOptions, category));
  }
  render();
}

function toggleTroubleshooting(stepId) {
  const current = selectedCase();
  if (!current || current.status === "resolved") {
    return;
  }

  const selected = new Set(state.selectedTroubleshooting);
  if (selected.has(stepId)) {
    selected.delete(stepId);
    state.selectedTroubleshooting = [...selected];
    current.troubleshooting = [...selected];
    addAudit(current, "Troubleshooting removed", labelFor(troubleshootingOptions, stepId));
    render();
    return;
  }

  const step = troubleshootingOptions.find((item) => item.id === stepId);
  selected.add(stepId);
  state.selectedTroubleshooting = [...selected];
  current.troubleshooting = [...selected];
  addAudit(current, "Troubleshooting selected", step.label);
  addFeed("Troubleshooting", `${current.title}: ${step.label}.`, "neutral");
  advance(step.cost);
}

function resolveCurrent(resolutionId) {
  const current = selectedCase();
  if (!current || current.status === "resolved") {
    return;
  }

  const option = resolutionOptions.find((item) => item.id === resolutionId);
  if (option.resource && state.resources[option.resource].remaining <= 0) {
    addFeed("Resource unavailable", `${state.resources[option.resource].label} are already committed. Pick another path or wait.`, "bad");
    changeMetric("sla", -3);
    render();
    return;
  }

  if (option.resource) {
    state.resources[option.resource].remaining -= 1;
  }

  current.diagnosis = state.selectedDiagnosis;
  current.category = state.selectedCategory;
  current.priority = state.selectedPriority;
  current.troubleshooting = [...state.selectedTroubleshooting];
  current.resolution = resolutionId;
  current.status = "resolved";
  current.evaluation = evaluateCase(current);
  current.score = current.evaluation.score;
  current.quality = current.evaluation.quality;
  current.severity = current.evaluation.severity;
  addAudit(current, "Final action", `${option.label}: ${option.note}`);
  addAudit(current, "Close review", `${current.quality} / ${current.severity} severity / score ${current.score}`);

  current.review = makeCloseReview(current, option);
  state.reviews.unshift(current.review);
  applyResolutionConsequences(current, option, current.evaluation);
  advance(option.cost);

  const next = openCases()[0];
  state.selectedId = next ? next.id : current.id;
  state.selectedDiagnosis = next ? next.diagnosis : current.diagnosis;
  state.selectedCategory = next ? next.category : current.category;
  state.selectedPriority = next ? next.priority : current.priority;
  state.selectedTroubleshooting = next ? [...next.troubleshooting] : [...current.troubleshooting];
  render();
  showCloseReview(current.review);
}

function evaluateCase(caseItem) {
  const resolutionCorrect = caseItem.correctResolution === caseItem.resolution || caseItem.acceptAlso.includes(caseItem.resolution);
  const diagnosisCorrect = caseItem.correctDiagnosis === caseItem.diagnosis;
  const categoryCorrect = caseItem.correctCategory === caseItem.category;
  const troubleshootingCorrect = caseItem.correctTroubleshooting.some((step) => caseItem.troubleshooting.includes(step));
  const priorityCorrect = caseItem.correctPriority === caseItem.priority;
  const verified = caseItem.revealed.includes("verify");
  const investigated = caseItem.revealed.includes("diagnostics") || caseItem.revealed.includes("records") || caseItem.revealed.includes("question");
  let score = 0;

  if (diagnosisCorrect) score += 15;
  if (categoryCorrect) score += 15;
  if (troubleshootingCorrect) score += 20;
  if (resolutionCorrect) score += 25;
  if (priorityCorrect) score += 15;
  if (verified) score += 5;
  if (investigated) score += 5;

  if (caseItem.securityRisk && !verified && ["reset_access", "remote_fix", "dispatch"].includes(caseItem.resolution)) {
    score -= 25;
  }

  if (caseItem.securityRisk && !troubleshootingCorrect && caseItem.resolution !== "deny") {
    score -= 10;
  }

  const policyViolation = (
    caseItem.securityRisk &&
    !verified &&
    ["reset_access", "remote_fix", "dispatch"].includes(caseItem.resolution)
  ) || (
    caseItem.correctResolution === "deny" &&
    !["deny", "security"].includes(caseItem.resolution)
  );

  const reasons = [];
  if (diagnosisCorrect) reasons.push("Diagnosis matched the evidence.");
  else reasons.push("Diagnosis did not match the evidence.");
  if (categoryCorrect) reasons.push("Category routed to the right owner.");
  else reasons.push("Category would route to the wrong owner.");
  if (priorityCorrect) reasons.push("Priority matched the incident impact.");
  else reasons.push(`Priority should have been ${caseItem.correctPriority}.`);
  if (troubleshootingCorrect) reasons.push("Troubleshooting step addressed the likely cause.");
  else reasons.push("Troubleshooting step did not address the likely cause.");
  if (verified) reasons.push("Identity/risk verification was documented.");
  else if (caseItem.securityRisk) reasons.push("Security-sensitive request closed without identity verification.");
  if (policyViolation) reasons.push("Policy violation: unsafe access or data handling decision.");

  const finalScore = Math.max(0, score);
  let quality = "Incomplete";
  if (policyViolation) {
    quality = "Policy Violation";
  } else if (finalScore >= 85) {
    quality = "Clean";
  } else if (finalScore >= 70) {
    quality = "Risky";
  }

  let severity = "Minor";
  if (quality === "Policy Violation" || (caseItem.securityRisk && finalScore < 70) || (caseItem.correctPriority === "P1" && !resolutionCorrect)) {
    severity = "Major";
  } else if (quality === "Risky" || quality === "Incomplete" || !priorityCorrect || !resolutionCorrect) {
    severity = "Moderate";
  }

  return {
    score: finalScore,
    quality,
    severity,
    reasons,
    checks: {
      diagnosisCorrect,
      categoryCorrect,
      troubleshootingCorrect,
      resolutionCorrect,
      priorityCorrect,
      verified,
      investigated,
      policyViolation
    }
  };
}

function scoreCase(caseItem) {
  return evaluateCase(caseItem).score;
}

function makeCloseReview(caseItem, option) {
  return {
    caseId: caseItem.id,
    title: caseItem.title,
    minute: state.time,
    score: caseItem.score,
    quality: caseItem.quality,
    severity: caseItem.severity,
    finalAction: option.label,
    verification: caseItem.revealed.includes("verify") ? "Documented" : "Not documented",
    diagnosis: caseItem.diagnosis ? labelFor(diagnosisOptions, caseItem.diagnosis) : "Missing",
    category: caseItem.category ? labelFor(categoryOptions, caseItem.category) : "Missing",
    priority: caseItem.priority || "Missing",
    troubleshooting: chosenTroubleshootingLabels(caseItem),
    reasons: caseItem.evaluation.reasons,
    audit: caseItem.audit.slice(0, 6),
    followUpGenerated: !caseItem.isFollowUp
  };
}

function showCloseReview(review) {
  els.closeReviewTitle.textContent = review.title;
  els.closeReviewBadge.textContent = `${review.quality} | ${review.severity}`;
  els.closeReviewBadge.className = `review-badge ${review.quality.toLowerCase().replace(/\s+/g, "-")} severity-${review.severity.toLowerCase()}`;
  els.closeReviewBody.innerHTML = `
    <div class="review-score">
      <div><span>Score</span><strong>${review.score}</strong></div>
      <div><span>Verification</span><strong>${review.verification}</strong></div>
      <div><span>Follow-up</span><strong>${review.followUpGenerated ? "Queued later" : "None"}</strong></div>
    </div>
    <dl class="review-grid">
      <dt>Diagnosis</dt><dd>${review.diagnosis}</dd>
      <dt>Category</dt><dd>${review.category}</dd>
      <dt>Priority</dt><dd>${review.priority}</dd>
      <dt>Troubleshooting</dt><dd>${review.troubleshooting}</dd>
      <dt>Final Action</dt><dd>${review.finalAction}</dd>
    </dl>
    <h3>Assessment</h3>
    <ul class="review-list">
      ${review.reasons.map((reason) => `<li>${reason}</li>`).join("")}
    </ul>
    <h3>Audit Trail</h3>
    <ol class="audit-list">
      ${review.audit.map((entry) => `<li><span>${formatTime(entry.minute)}</span><strong>${entry.title}</strong><p>${entry.text}</p></li>`).join("")}
    </ol>
  `;
  els.closeReviewModal.classList.remove("hidden");
}

function hideCloseReview() {
  els.closeReviewModal.classList.add("hidden");
}

function correctiveResolutionFor(caseItem) {
  const byCategory = {
    security: "security",
    access: "security",
    apps: "apps",
    network: "network",
    hardware: "dispatch",
    asset: "dispatch"
  };
  return byCategory[caseItem.correctCategory] || "apps";
}

function followUpTitle(caseItem, good) {
  if (good) {
    return caseItem.securityRisk
      ? `Closure audit: ${caseItem.title}`
      : `User confirmation: ${caseItem.title}`;
  }
  if (caseItem.severity === "Major" && caseItem.securityRisk) {
    return `Security review: ${caseItem.title}`;
  }
  if (caseItem.severity === "Major") {
    return `Incident review: ${caseItem.title}`;
  }
  if (caseItem.correctPriority === "P1" || caseItem.risk.sla === "Critical") {
    return `Manager complaint: ${caseItem.title}`;
  }
  return `Corrective follow-up: ${caseItem.title}`;
}

function makeFollowUpCase(caseItem, good, minute) {
  const correctiveOwner = caseItem.securityRisk ? "Security" : "Service owner";
  const correctiveResolution = correctiveResolutionFor(caseItem);
  const severity = caseItem.severity || (good ? "Minor" : "Moderate");
  const originDecision = `${chosenResolutionLabel(caseItem)} after ${chosenTroubleshootingLabels(caseItem)}`;
  const followTitle = followUpTitle(caseItem, good);
  const originTag = `From: ${caseItem.title.split(":")[0].slice(0, 18)}`;
  return {
    id: `follow-${caseItem.id}-${minute}-${good ? "closure" : "review"}`,
    arrival: minute,
    channel: "Follow-up",
    title: followTitle,
    requester: good ? "Supervisor desk" : (severity === "Major" ? "Incident manager" : "Team manager"),
    department: caseItem.department,
    location: caseItem.location,
    signals: good
      ? ["Follow-up", "Closure", originTag]
      : ["Follow-up", `${severity} review`, caseItem.securityRisk ? "Security risk" : "SLA risk"],
    risk: {
      security: good ? "Low" : (caseItem.securityRisk ? "High" : "Medium"),
      impact: good ? "Handoff quality" : `${severity} corrective work`,
      verification: "Ticket-linked",
      sla: good ? "Low" : (severity === "Major" ? "Critical" : "Rising")
    },
    report: good
      ? "The incident is stable. Confirm the user impact is closed, document what changed, and leave a clean handoff."
      : "The earlier decision created fallout. Re-check the record, contain remaining risk, and route the corrective action.",
    facts: {
      Original: caseItem.title,
      "Original decision": originDecision,
      "Close quality": `${caseItem.quality} / ${severity}`,
      "Original score": String(caseItem.score),
      Category: labelFor(categoryOptions, caseItem.correctCategory),
      Outcome: good ? "Closure audit" : "Corrective follow-up"
    },
    evidence: [
      {
        source: good ? "Closure note" : `${severity} escalation`,
        text: good
          ? `${caseItem.consequence.good} Confirm notes and user impact before archiving.`
          : `${caseItem.consequence.bad} Original close was ${caseItem.quality}: ${caseItem.evaluation.reasons.slice(-2).join(" ")}`,
        tone: good ? "good" : "risk"
      }
    ],
    reveals: {
      verify: { source: "Ticket link", text: "The follow-up is tied to the original case and requester history.", tone: "good" },
      question: { source: "User check", text: good ? "The affected team confirms service is stable." : "The affected team reports the issue is still creating work.", tone: good ? "good" : "risk" },
      diagnostics: { source: "Health check", text: good ? "No new matching alerts are active." : `${correctiveOwner} still needs the remaining risk routed.`, tone: good ? "good" : "risk" },
      records: { source: "Case review", text: "The missing piece is a clear note trail and owner handoff.", tone: "good" }
    },
    correctPriority: good ? "P4" : (caseItem.securityRisk ? "P2" : "P3"),
    correctDiagnosis: caseItem.correctDiagnosis,
    correctCategory: caseItem.correctCategory,
    correctTroubleshooting: ["document_notes"],
    correctResolution: good ? "monitor" : correctiveResolution,
    acceptAlso: good ? ["remote_fix"] : ["dispatch"],
    securityRisk: !good && caseItem.securityRisk,
    isFollowUp: true,
    origin: {
      id: caseItem.id,
      title: caseItem.title,
      decision: originDecision,
      quality: caseItem.quality,
      severity
    },
    consequence: {
      good: "The follow-up is documented and closed cleanly.",
      bad: "The follow-up stayed muddy and the next analyst has to reopen it."
    },
    status: "pending",
    revealed: ["initial"],
    audit: [
      { minute, title: "Follow-up opened", text: `${followTitle} generated from ${caseItem.title}` },
      { minute: state.time, title: "Original decision", text: `${originDecision} / ${caseItem.quality} / ${severity}` }
    ],
    diagnosis: null,
    category: null,
    priority: null,
    troubleshooting: [],
    resolution: null,
    score: null,
    quality: null,
    severity: null
  };
}

function metricChangesForEvaluation(caseItem, option, evaluation, cleanClose) {
  if (cleanClose) {
    return {
      trust: 4,
      sla: caseItem.correctPriority === caseItem.priority ? 5 : 1,
      security: caseItem.securityRisk ? 6 : 1,
      budget: option.resource ? -2 : 1
    };
  }

  const severityPenalty = evaluation.severity === "Major" ? 2 : evaluation.severity === "Moderate" ? 1 : 0;
  return {
    trust: -5 - severityPenalty,
    sla: (caseItem.correctPriority === caseItem.priority ? -2 : -7) - severityPenalty,
    security: (caseItem.securityRisk ? -8 : -2) - (severityPenalty * 2),
    budget: (option.resource ? -5 : -3) - severityPenalty
  };
}

function applyResolutionConsequences(caseItem, option, evaluation) {
  const cleanClose = evaluation.quality === "Clean";
  const prefix = cleanClose ? "Clean close" : evaluation.quality;
  addFeed(prefix, `${caseItem.title}: ${option.label}. ${evaluation.severity} consequence risk.`, cleanClose ? "good" : "bad", state.time, evaluation.severity);

  const immediateChanges = metricChangesForEvaluation(caseItem, option, evaluation, cleanClose);
  Object.entries(immediateChanges).forEach(([metric, amount]) => changeMetric(metric, amount));

  const delay = cleanClose ? 28 : evaluation.severity === "Major" ? 18 : 36;
  const followUpMinute = state.time + delay;
  const scheduledItem = {
    minute: followUpMinute,
    title: cleanClose ? "Closure confirmed" : `${evaluation.severity} consequence landed`,
    text: cleanClose ? caseItem.consequence.good : caseItem.consequence.bad,
    tone: cleanClose ? "good" : "bad",
    severity: evaluation.severity,
    metricChanges: cleanClose
      ? { trust: 2 }
      : {
        trust: evaluation.severity === "Major" ? -7 : -5,
        sla: evaluation.severity === "Major" ? -7 : -4,
        security: caseItem.securityRisk ? (evaluation.severity === "Major" ? -6 : -3) : 0
      }
  };

  if (!caseItem.isFollowUp) {
    scheduledItem.followUp = makeFollowUpCase(caseItem, cleanClose, followUpMinute);
    scheduledItem.text += cleanClose
      ? " A closure follow-up entered the queue."
      : " A corrective follow-up entered the queue.";
  }

  state.scheduled.push(scheduledItem);
  addAudit(caseItem, "Consequence scheduled", `${scheduledItem.title} at ${formatTime(followUpMinute)}`);
}

function endShift() {
  hideCloseReview();
  const unresolved = openCases().length;
  if (unresolved > 0) {
    changeMetric("sla", -unresolved * 5);
    addFeed("Shift closed with open work", `${unresolved} incident${unresolved === 1 ? "" : "s"} rolled to the next analyst.`, "bad");
  }
  while (state.scheduled.length) {
    const nextMinute = Math.min(...state.scheduled.map((item) => item.minute));
    state.time = Math.max(state.time, nextMinute);
    processScheduled();
  }
  showSummary();
}

function gradeLabel(score) {
  if (score >= 86) return "Calm under pressure";
  if (score >= 70) return "Competent shift";
  if (score >= 52) return "Messy but survivable";
  return "Incident review scheduled";
}

function showSummary() {
  const avg = Math.round(Object.values(state.metrics).reduce((sum, value) => sum + value, 0) / 4);
  const resolved = state.cases.filter((item) => item.status === "resolved").length;
  const reviews = state.reviews;
  const clean = reviews.filter((item) => item.quality === "Clean").length;
  const risky = reviews.filter((item) => item.quality === "Risky").length;
  const incomplete = reviews.filter((item) => item.quality === "Incomplete").length;
  const policy = reviews.filter((item) => item.quality === "Policy Violation").length;
  const major = reviews.filter((item) => item.severity === "Major").length;
  const followUps = state.cases.filter((item) => item.isFollowUp).length;
  const best = reviews.filter((item) => item.score !== null).sort((a, b) => b.score - a.score)[0];
  const worst = reviews.filter((item) => item.quality !== "Clean").sort((a, b) => a.score - b.score)[0];

  els.summaryBody.innerHTML = `
    <p><strong>${gradeLabel(avg)}</strong> with a shift health score of ${avg}.</p>
    <ul class="summary-list">
      <li>${resolved} of ${state.cases.length} incidents resolved.</li>
      <li>${clean} clean closes, ${risky} risky closes, ${incomplete} incomplete closes, ${policy} policy violations.</li>
      <li>${followUps} follow-up tickets generated and ${major} major consequence${major === 1 ? "" : "s"} recorded.</li>
      <li>Best triage call: ${best ? `${best.title} (${best.score})` : "None yet"}.</li>
      <li>Most expensive mistake: ${worst ? `${worst.title} (${worst.quality}, ${worst.severity})` : "None"}.</li>
      <li>Security ${state.metrics.security}, SLA ${state.metrics.sla}, Trust ${state.metrics.trust}, Budget ${state.metrics.budget}.</li>
    </ul>
    <p>Audit trails and consequence reviews are now part of the shift record.</p>
  `;
  els.summaryModal.classList.remove("hidden");
}

function restartGame() {
  state = cloneState(initialState);
  hideCloseReview();
  els.summaryModal.classList.add("hidden");
  unlockArrivals();
  render();
}

function render() {
  const available = availableCases();
  const open = openCases();
  const current = selectedCase();

  els.clock.textContent = formatTime(state.time);
  els.queueCount.textContent = available.length;
  els.openCount.textContent = open.length;

  renderShiftControl(available);
  renderQueue(available);
  renderChannelStatus(open);
  renderResources();
  renderMetrics();
  renderFeed();
  renderRules();
  renderCase(current);
  renderStageBar(current);
  renderNextAction(current);
  renderStageHighlights(current);
  renderWorkflow(current);
  renderActions(current);
  renderDecision(current);
}

function renderShiftControl(available) {
  const noArrivalsYet = available.length === 0 && state.time === START_MINUTE;
  els.advanceTime.textContent = noArrivalsYet ? "Start Shift" : "Wait 10m";
  els.advanceTime.title = noArrivalsYet ? "Start shift" : "Wait 10 minutes";
  els.advanceTime.setAttribute("aria-label", els.advanceTime.title);
}

function renderStageBar(item) {
  const stage = currentStage(item);
  els.stageTitle.textContent = stage.title;
  els.stageHint.textContent = stage.hint;
  els.stageMissing.innerHTML = stage.missing.map((missing) => `<span>${missing}</span>`).join("");
  els.evidenceProgress.textContent = item ? `Evidence ${evidenceCount(item)}/${evidenceTotal(item)}` : "Evidence 0/0";
  els.requirementStatus.innerHTML = requirementItems(item).map((requirement) => `
    <span class="${requirement.done ? "done" : ""}">${requirement.done ? "OK" : "--"} ${requirement.label}</span>
  `).join("");
}

function renderNextAction(item) {
  const next = nextActionFor(item);
  els.nextActionTitle.textContent = next.title;
  els.nextActionHint.textContent = next.hint;
  els.nextActionButton.textContent = next.label;
  els.nextActionButton.dataset.target = next.target;
}

function renderStageHighlights(item) {
  const stage = currentStage(item);
  const allTargets = [
    els.reportPanel,
    els.evidencePanel,
    els.classificationPanel,
    els.actionsPanel,
    els.decisionPanel,
    els.troubleshootSection,
    els.resolutionSection
  ];
  allTargets.forEach((node) => node.classList.remove("stage-focus", "substage-focus"));

  if (stage.id === "investigate") {
    els.actionsPanel.classList.add("stage-focus");
    els.evidencePanel.classList.add("substage-focus");
  } else if (stage.id === "classify") {
    els.classificationPanel.classList.add("stage-focus");
  } else if (stage.id === "troubleshoot") {
    els.decisionPanel.classList.add("stage-focus");
    els.troubleshootSection.classList.add("substage-focus");
  } else if (stage.id === "close") {
    els.decisionPanel.classList.add("stage-focus");
    els.resolutionSection.classList.add("substage-focus");
  }
}

function renderChannelStatus(open) {
  const counts = channelStatus.map((channel) => ({
    ...channel,
    count: open.filter((item) => item.channel === channel.id).length
  }));

  els.channelStatus.innerHTML = counts.map((channel) => `
    <div class="channel-tile ${channel.count ? "active" : ""}">
      <span>${channel.label}</span>
      <strong>${channel.count}</strong>
    </div>
  `).join("") + `
    <div class="channel-tile ${state.resources.field.remaining < state.resources.field.max ? "active" : ""}">
      <span>Dispatch</span>
      <strong>${state.resources.field.remaining}</strong>
    </div>
  `;
}

function renderWorkflow(item) {
  const stage = currentStage(item);
  const stages = [
    { id: "ticket", label: "Arrive", full: "Ticket arrives", done: Boolean(item), active: stage.id === "start" },
    { id: "review", label: "Review", full: "Review user, device, symptoms, history", done: Boolean(item), active: stage.id === "investigate" },
    { id: "investigate", label: "Investigate", full: "Ask questions or run diagnostics", done: Boolean(item && item.revealed.length > 1), active: stage.id === "investigate" },
    { id: "classify", label: "Classify", full: "Assign priority and category", done: Boolean(item && item.priority && item.category && item.diagnosis), active: stage.id === "classify" },
    { id: "troubleshoot", label: "Troubleshoot", full: "Choose troubleshooting steps", done: Boolean(item && item.troubleshooting.length), active: stage.id === "troubleshoot" },
    { id: "close", label: "Close", full: "Resolve, escalate, dispatch, deny, postpone", done: Boolean(item && item.status === "resolved"), active: stage.id === "close" },
    { id: "follow", label: "Follow up", full: "Consequences and follow-up tickets", done: Boolean(item && item.status === "resolved"), active: stage.id === "follow" }
  ];

  els.workflowSteps.innerHTML = stages.map((stage, index) => {
    const className = stage.done ? "done" : stage.active ? "active" : "";
    const marker = stage.done ? "OK" : String(index + 1);
    return `<li class="workflow-step ${className}" title="${stage.full}"><span>${marker}</span><strong>${stage.label}</strong></li>`;
  }).join("");
  els.workflowHint.textContent = stage.hint;
}

function renderQueue(items) {
  if (!items.length) {
    els.queueList.innerHTML = `<p class="queue-meta">Shift not started. Press Start Shift to receive the first call, ticket, chat, alert, or walk-up.</p>`;
    return;
  }

  els.queueList.innerHTML = items.map((item) => {
    const active = item.id === state.selectedId ? " active" : "";
    const resolved = item.status === "resolved" ? " resolved" : "";
    const age = Math.max(0, state.time - item.arrival);
    const stage = stageLabel(item);
    const warning = item.securityRisk && !item.revealed.includes("verify") && item.status !== "resolved";
    return `
      <button class="queue-item${active}${resolved}" data-select="${item.id}">
        <span class="queue-main">
          <strong>${item.title}</strong>
          <span class="queue-meta">${formatTime(item.arrival)} arrival | ${age}m old | ${item.requester}</span>
          <span class="queue-stage">${stage}${warning ? " | Verify before access changes" : ""}</span>
          <span class="signal-list queue-signals">
            ${signalTags(item).slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}
          </span>
        </span>
        <span class="queue-badges">
          <span class="channel-badge">${item.channel}</span>
          ${item.category ? `<span class="category-badge">${labelFor(categoryOptions, item.category)}</span>` : ""}
          ${item.priority ? `<span class="priority-badge">${item.priority}</span>` : ""}
          ${item.quality ? `<span class="quality-badge severity-${item.severity.toLowerCase()}">${item.quality}</span>` : ""}
        </span>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.select;
      syncSelectionFromCase(selectedCase());
      render();
    });
  });
}

function renderResources() {
  els.resourceList.innerHTML = Object.entries(state.resources).map(([, resource]) => {
    const pct = (resource.remaining / resource.max) * 100;
    const tone = pct <= 25 ? "danger" : pct <= 50 ? "warn" : "";
    return `
      <div class="resource-row">
        <div class="resource-top"><span>${resource.label}</span><strong>${resource.remaining}/${resource.max}</strong></div>
        <div class="meter ${tone}"><span style="width:${pct}%"></span></div>
      </div>
    `;
  }).join("");
}

function renderMetrics() {
  const labels = {
    trust: "User trust",
    security: "Security posture",
    sla: "SLA health",
    budget: "Resource budget"
  };

  els.metricList.innerHTML = Object.entries(state.metrics).map(([key, value]) => {
    const tone = value < 35 ? "danger" : value < 55 ? "warn" : "";
    return `
      <div class="metric-row">
        <div class="metric-top"><span class="metric-label">${labels[key]}</span><strong>${value}</strong></div>
        <div class="meter ${tone}"><span style="width:${value}%"></span></div>
      </div>
    `;
  }).join("");
}

function renderFeed() {
  els.feed.innerHTML = state.feed.slice(0, 18).map((item) => `
    <article class="feed-item ${item.tone} ${item.severity ? `severity-${item.severity.toLowerCase()}` : ""}">
      <span class="feed-time">${formatTime(item.minute)}</span>
      ${item.severity ? `<span class="feed-severity">${item.severity}</span>` : ""}
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderRules() {
  els.rulesList.innerHTML = activeRules().map((rule) => `<li>${rule.text}</li>`).join("");
}

function renderAuditPreview(item) {
  const entries = (item.audit || []).slice(0, 4);
  if (!entries.length) return "No audit entries yet";
  return `<ol class="case-audit">${entries.map((entry) => `
    <li><span>${formatTime(entry.minute)}</span><strong>${entry.title}</strong><p>${entry.text}</p></li>
  `).join("")}</ol>`;
}

function renderCase(item) {
  if (!item) {
    els.caseTitle.textContent = "Shift not started";
    els.caseSignals.innerHTML = "";
    els.caseStatus.textContent = "Ready";
    els.caseFacts.innerHTML = `
      <dt>Status</dt><dd>Desk staffed and monitoring systems idle.</dd>
      <dt>Next</dt><dd>Start the shift to receive live work.</dd>
    `;
    els.evidenceLog.innerHTML = `<p class="queue-meta">Evidence appears here after a ticket, call, chat, alert, or walk-up arrives.</p>`;
    renderRiskLens(null);
    return;
  }

  els.caseTitle.textContent = item.title;
  els.caseSignals.innerHTML = signalTags(item).map((tag) => `<span>${tag}</span>`).join("");
  els.caseStatus.textContent = item.status === "resolved" ? `${item.quality} | ${item.score}` : `${item.channel} | ${formatTime(item.arrival)}`;
  els.caseFacts.innerHTML = `
    <dt>Requester</dt><dd>${item.requester}</dd>
    <dt>Department</dt><dd>${item.department}</dd>
    <dt>Location</dt><dd>${item.location}</dd>
    <dt>Report</dt><dd>${item.report}</dd>
    ${item.origin ? `<dt>Original Decision</dt><dd>${item.origin.decision} | ${item.origin.quality} | ${item.origin.severity}</dd>` : ""}
    <dt>Classification</dt><dd>${item.diagnosis ? labelFor(diagnosisOptions, item.diagnosis) : "Undiagnosed"} | ${item.category ? labelFor(categoryOptions, item.category) : "Uncategorized"} | ${item.priority || "No priority"}</dd>
    <dt>Troubleshooting</dt><dd>${item.troubleshooting.length ? item.troubleshooting.map((step) => labelFor(troubleshootingOptions, step)).join(", ") : "No step chosen"}</dd>
    ${item.quality ? `<dt>Close Review</dt><dd>${item.quality} | ${item.severity} | Score ${item.score}</dd>` : ""}
    <dt>Audit Trail</dt><dd>${renderAuditPreview(item)}</dd>
    ${Object.entries(item.facts).map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`).join("")}
  `;

  const evidence = [...item.evidence];
  item.revealed
    .filter((id) => id !== "initial")
    .forEach((id) => evidence.push(item.reveals[id]));

  els.evidenceLog.innerHTML = evidence.map((entry) => `
    <article class="evidence-item ${entry.tone}">
      <span class="evidence-source">${entry.source}</span>
      <p>${entry.text}</p>
    </article>
  `).join("");
  renderRiskLens(item);
}

function renderRiskLens(item) {
  if (!item) {
    els.riskLens.innerHTML = `
      <div><span>Security</span><strong>Idle</strong></div>
      <div><span>Impact</span><strong>None</strong></div>
      <div><span>Verification</span><strong>None</strong></div>
      <div><span>SLA</span><strong>None</strong></div>
    `;
    return;
  }

  els.riskLens.innerHTML = `
    <div class="${item.risk.security === "High" ? "risk-high" : item.risk.security === "Medium" ? "risk-medium" : ""}"><span>Security</span><strong>${item.risk.security}</strong></div>
    <div><span>Impact</span><strong>${item.risk.impact}</strong></div>
    <div><span>Verification</span><strong>${item.risk.verification}</strong></div>
    <div class="${item.risk.sla === "Critical" ? "risk-high" : item.risk.sla === "Rising" ? "risk-medium" : ""}"><span>SLA</span><strong>${item.risk.sla}</strong></div>
  `;
}

function renderActions(item) {
  const disabled = !item || item.status === "resolved";
  els.actionHint.textContent = disabled ? "Select an unresolved incident." : "Every action spends shift time.";

  els.investigationActions.innerHTML = investigationActions.map((action) => {
    const done = item && item.revealed.includes(action.id);
    return `
      <button class="tool-button" data-investigate="${action.id}" ${disabled || done ? "disabled" : ""}>
        <span class="symbol">${action.symbol}</span>
        <strong>${action.label}</strong>
        <small>${done ? "Already checked." : `${action.cost}m | ${action.description}`}</small>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-investigate]").forEach((button) => {
    button.addEventListener("click", () => reveal(selectedCase(), button.dataset.investigate));
  });
}

function renderDecision(item) {
  const disabled = !item || item.status === "resolved";
  const missingClassification = !item || !item.diagnosis || !item.category || !item.priority;
  const troubleshootDisabled = disabled || missingClassification;
  const resolutionDisabled = troubleshootDisabled || !item.troubleshooting.length;
  const missingNames = requirementItems(item).filter((requirement) => ["diagnosis", "category", "priority"].includes(requirement.id) && !requirement.done).map((requirement) => requirement.label);

  if (disabled) {
    els.troubleshootHelper.textContent = item && item.status === "resolved" ? "Ticket already resolved." : "Select an unresolved incident.";
    els.resolutionHelper.textContent = item && item.status === "resolved" ? "Ticket already resolved." : "Select an unresolved incident.";
  } else if (missingClassification) {
    els.troubleshootHelper.textContent = `Classify first: ${missingNames.join(", ")} missing.`;
    els.resolutionHelper.textContent = "Choose troubleshooting before closing.";
  } else if (!item.troubleshooting.length) {
    els.troubleshootHelper.textContent = "Choose at least one concrete troubleshooting step.";
    els.resolutionHelper.textContent = "Final action unlocks after troubleshooting.";
  } else {
    els.troubleshootHelper.textContent = "Troubleshooting selected. Additional steps spend more shift time.";
    els.resolutionHelper.textContent = "Ready to choose the final path.";
  }

  els.diagnosisControl.innerHTML = diagnosisOptions.map((diagnosis) => `
    <button data-diagnosis="${diagnosis.id}" class="${state.selectedDiagnosis === diagnosis.id ? "selected" : ""}" ${disabled ? "disabled" : ""}>${diagnosis.label}</button>
  `).join("");

  els.categoryControl.innerHTML = categoryOptions.map((category) => `
    <button data-category="${category.id}" class="${state.selectedCategory === category.id ? "selected" : ""}" ${disabled ? "disabled" : ""}>${category.label}</button>
  `).join("");

  els.priorityControl.innerHTML = priorities.map((priority) => `
    <button data-priority="${priority}" class="${state.selectedPriority === priority ? "selected" : ""}" ${disabled ? "disabled" : ""}>${priority}</button>
  `).join("");

  els.troubleshootControl.innerHTML = troubleshootingOptions.map((step) => `
    <button data-troubleshoot="${step.id}" class="${state.selectedTroubleshooting.includes(step.id) ? "selected" : ""}" ${troubleshootDisabled ? "disabled" : ""}>
      ${step.label}
      <small>${step.cost}m</small>
    </button>
  `).join("");

  els.resolutionGrid.innerHTML = resolutionOptions.map((option) => `
    <button class="resolution-button" data-resolution="${option.id}" ${resolutionDisabled ? "disabled" : ""}>
      ${option.label}
      <small>${option.cost}m${option.resource ? ` | ${state.resources[option.resource].remaining} left` : ""}</small>
    </button>
  `).join("");

  document.querySelectorAll("[data-diagnosis]").forEach((button) => {
    button.addEventListener("click", () => chooseDiagnosis(button.dataset.diagnosis));
  });
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => chooseCategory(button.dataset.category));
  });
  document.querySelectorAll("[data-priority]").forEach((button) => {
    button.addEventListener("click", () => choosePriority(button.dataset.priority));
  });
  document.querySelectorAll("[data-troubleshoot]").forEach((button) => {
    button.addEventListener("click", () => toggleTroubleshooting(button.dataset.troubleshoot));
  });
  document.querySelectorAll("[data-resolution]").forEach((button) => {
    button.addEventListener("click", () => resolveCurrent(button.dataset.resolution));
  });
}

els.advanceTime.addEventListener("click", () => {
  const available = availableCases();
  if (!available.length && futureCases().length) {
    const nextArrival = Math.min(...futureCases().map((item) => item.arrival));
    advance(Math.max(1, nextArrival - state.time));
    return;
  }
  advance(10);
});
els.endShift.addEventListener("click", endShift);
els.restartGame.addEventListener("click", restartGame);
els.ackCloseReview.addEventListener("click", hideCloseReview);
els.nextActionButton.addEventListener("click", () => jumpToTarget(els.nextActionButton.dataset.target));

unlockArrivals();
render();

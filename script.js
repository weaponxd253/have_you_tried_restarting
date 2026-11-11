(() => {
const { START_MINUTE, HOLD_MINUTES, priorities, diagnosisOptions, categoryOptions, troubleshootingOptions, resolutionOptions, investigationActions, channelStatus, rules, formatTime, labelFor, evidenceCount, evidenceTotal, workable, classificationUnlocked, requirementItems, stageLabel, signalTags, activeRules, relevantRulesFor, strongestRuleFor, closeReadinessFor, resourceExhausted, finalActionHintFor, availableCases, futureCases, openCases, selectedCase, pct, strongestPattern, advance, slaDueMinute, holdCostFor, describeHoldCost, postponeCurrent, resumeCurrent, currentStage, missingClassificationTarget, nextActionFor, reveal, choosePriority, chooseDiagnosis, chooseCategory, toggleTroubleshooting, requestResolve, isMissReason, confirmCloseWarning, endShift, gradeLabel, shiftSummary, restartGame, queueOrder, selectTicket, waitForWork, cancelCloseWarning } = shiftEngine;
const els = {
  clock: document.querySelector("#clock"),
  closedCount: document.querySelector("#closedCount"),
  mobileQueueCount: document.querySelector("#mobileQueueCount"),
  caseSla: document.querySelector("#caseSla"),
  openCount: document.querySelector("#openCount"),
  queueList: document.querySelector("#queueList"),
  patternHint: document.querySelector("#patternHint"),
  resourceList: document.querySelector("#resourceList"),
  metricList: document.querySelector("#metricList"),
  feed: document.querySelector("#feed"),
  caseTitle: document.querySelector("#caseTitle"),
  caseSignals: document.querySelector("#caseSignals"),
  caseStatus: document.querySelector("#caseStatus"),
  stageTitle: document.querySelector("#stageTitle"),
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
  diagnosisSection: document.querySelector("#diagnosisSection"),
  categorySection: document.querySelector("#categorySection"),
  prioritySection: document.querySelector("#prioritySection"),
  actionsPanel: document.querySelector("#actionsPanel"),
  decisionPanel: document.querySelector("#decisionPanel"),
  troubleshootSection: document.querySelector("#troubleshootSection"),
  resolutionSection: document.querySelector("#resolutionSection"),
  caseFacts: document.querySelector("#caseFacts"),
  caseMemory: document.querySelector("#caseMemory"),
  evidenceLog: document.querySelector("#evidenceLog"),
  riskLens: document.querySelector("#riskLens"),
  ruleRiskNote: document.querySelector("#ruleRiskNote"),
  rulesList: document.querySelector("#rulesList"),
  investigationActions: document.querySelector("#investigationActions"),
  priorityControl: document.querySelector("#priorityControl"),
  diagnosisControl: document.querySelector("#diagnosisControl"),
  categoryControl: document.querySelector("#categoryControl"),
  troubleshootControl: document.querySelector("#troubleshootControl"),
  resolutionGrid: document.querySelector("#resolutionGrid"),
  closeReadiness: document.querySelector("#closeReadiness"),
  actionHint: document.querySelector("#actionHint"),
  troubleshootHelper: document.querySelector("#troubleshootHelper"),
  resolutionHelper: document.querySelector("#resolutionHelper"),
  holdButton: document.querySelector("#holdButton"),
  holdHelper: document.querySelector("#holdHelper"),
  advanceTime: document.querySelector("#advanceTime"),
  endShift: document.querySelector("#endShift"),
  summaryModal: document.querySelector("#summaryModal"),
  summaryBody: document.querySelector("#summaryBody"),
  restartGame: document.querySelector("#restartGame"),
  closeReviewModal: document.querySelector("#closeReviewModal"),
  closeReviewTitle: document.querySelector("#closeReviewTitle"),
  closeReviewBadge: document.querySelector("#closeReviewBadge"),
  closeReviewBody: document.querySelector("#closeReviewBody"),
  ackCloseReview: document.querySelector("#ackCloseReview"),
  closeWarningModal: document.querySelector("#closeWarningModal"),
  closeWarningTitle: document.querySelector("#closeWarningTitle"),
  closeWarningBadge: document.querySelector("#closeWarningBadge"),
  closeWarningBody: document.querySelector("#closeWarningBody"),
  cancelCloseWarning: document.querySelector("#cancelCloseWarning"),
  confirmCloseWarning: document.querySelector("#confirmCloseWarning")
};

let modalReturnFocus = null;

// Phone layout shows one of ticket / queue / feed at a time; wider layouts ignore the attribute.
function setMobileView(view) {
  document.body.dataset.view = view;
  document.querySelectorAll(".mobile-tabs [data-view]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  });
}

function openModal(modal, initialFocus) {
  if (modal.classList.contains("hidden") && !topModal()) {
    modalReturnFocus = document.activeElement;
  }
  modal.classList.remove("hidden");
  const dialog = modal.querySelector(".summary-modal");
  if (dialog) dialog.scrollTop = 0;
  initialFocus?.focus({ preventScroll: true });
}

function closeModal(modal) {
  if (modal.classList.contains("hidden")) return;
  modal.classList.add("hidden");
  const next = topModal();
  if (next) {
    focusableIn(next)[0]?.focus();
  } else {
    // The control that opened the modal may have been re-rendered away; fall back to the next-action prompt.
    const target = modalReturnFocus && modalReturnFocus !== document.body && document.contains(modalReturnFocus) ? modalReturnFocus : els.nextActionButton;
    target.focus({ preventScroll: true });
    modalReturnFocus = null;
  }
}

function topModal() {
  return [...document.querySelectorAll(".modal-backdrop:not(.hidden)")].pop() || null;
}

function focusableIn(container) {
  return [...container.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
}

function handleModalKeys(event) {
  const modal = topModal();
  if (!modal) return;
  if (event.key === "Escape") {
    if (modal === els.closeReviewModal) hideCloseReview();
    if (modal === els.closeWarningModal) hideCloseWarning();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = focusableIn(modal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!modal.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function jumpToTarget(target) {
  const targetMap = {
    queue: els.queueList,
    actions: els.actionsPanel,
    classification: els.classificationPanel,
    diagnosis: els.diagnosisSection,
    category: els.categorySection,
    priority: els.prioritySection,
    troubleshoot: els.troubleshootSection,
    resolution: els.resolutionSection,
    feed: els.feed
  };
  if (target === "resume") {
    resumeCurrent();
    return;
  }
  const node = targetMap[target] || els.classificationPanel;
  if (target === "queue" && !availableCases().length && futureCases().length) {
    const nextArrival = Math.min(...futureCases().map((item) => item.arrival));
    advance(Math.max(1, nextArrival - shiftEngine.state.time));
    return;
  }
  setMobileView(target === "queue" || target === "feed" ? target : "ticket");
  node.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof node.focus === "function") {
    node.focus({ preventScroll: true });
  }
}

function showCloseReview(review) {
  els.closeReviewTitle.textContent = review.title;
  els.closeReviewBadge.textContent = `${review.quality} | ${review.severity}`;
  els.closeReviewBadge.className = `review-badge ${review.quality.toLowerCase().replace(/\s+/g, "-")} severity-${review.severity.toLowerCase()}`;
  els.closeReviewBody.innerHTML = `
    <div class="review-verdict">
      <div class="review-score-big"><span>Score</span><strong>${review.score}</strong></div>
      <div class="debrief-line lesson">
        <span>Lesson</span>
        <p>${review.lesson}</p>
      </div>
    </div>
    <h3>Assessment</h3>
    <ul class="review-list assessment">
      ${review.reasons.map((reason) => `<li class="${isMissReason(reason) ? "miss" : "hit"}">${reason}</li>`).join("")}
    </ul>
    ${review.readinessWarnings.length ? `
      <h3>Warnings Seen Before Close</h3>
      <ul class="review-list">
        ${review.readinessWarnings.map((warning) => `<li>${warning}</li>`).join("")}
      </ul>
    ` : ""}
    <div class="review-score">
      <div><span>Final Action</span><strong>${review.finalAction}</strong></div>
      <div><span>Verification</span><strong>${review.verification}</strong></div>
      <div><span>Readiness</span><strong>${review.readinessLabel}</strong></div>
      <div><span>Follow-up</span><strong>${review.followUpGenerated ? "Queued later" : "None"}</strong></div>
    </div>
    <details class="review-more">
      <summary>Your decisions</summary>
      <dl class="review-grid">
        <dt>Diagnosis</dt><dd>${review.diagnosis}</dd>
        <dt>Category</dt><dd>${review.category}</dd>
        <dt>Priority</dt><dd>${review.priority}</dd>
        <dt>Troubleshooting</dt><dd>${review.troubleshooting}</dd>
        <dt>Final Action</dt><dd>${review.finalAction}</dd>
      </dl>
    </details>
    <details class="review-more">
      <summary>Audit trail (${review.audit.length})</summary>
      <ol class="audit-list">
        ${review.audit.map((entry) => `<li><span>${formatTime(entry.minute)}</span><strong>${entry.title}</strong><p>${entry.text}</p></li>`).join("")}
      </ol>
    </details>
  `;
  openModal(els.closeReviewModal, els.ackCloseReview);
}

function hideCloseReview() {
  closeModal(els.closeReviewModal);
}

function showCloseWarning(resolutionId, readiness) {
  const option = resolutionOptions.find((item) => item.id === resolutionId);
  els.closeWarningTitle.textContent = `${option.label} may be unsafe`;
  els.closeWarningBadge.textContent = readiness.label;
  els.closeWarningBadge.className = `review-badge ${readiness.tone}`;
  els.closeWarningBody.innerHTML = `
    <p>${readiness.summary}</p>
    <ul class="review-list">
      ${readiness.confirmationWarnings.map((warning) => `<li>${warning.text}</li>`).join("")}
    </ul>
  `;
  openModal(els.closeWarningModal, els.cancelCloseWarning);
}

function hideCloseWarning() {
  cancelCloseWarning();
  closeModal(els.closeWarningModal);
}

function showSummary() {
  const { avg, modifier, shiftEndMinute, shiftCases, resolved, reviews, clean, risky, incomplete, policy, major, followUps, riskyFollowUps, warningsAcknowledged, policyWarningsAvoided, slaBreaches, postponed, stillHeld, repeatedPattern, skills, narrative, replayOptions, best, worst } = shiftSummary();
  els.summaryBody.innerHTML = `
    <div class="summary-hero ${avg >= 70 ? "good" : avg >= 52 ? "warn" : "bad"}">
      <span>Shift grade</span>
      <strong>${gradeLabel(avg)}</strong>
      <p>Shift health ${avg} | Scenario ${shiftEngine.state.shiftSeed} | ${modifier.label}</p>
    </div>
    <div class="summary-kpis">
      <div><span>Resolved</span><strong>${resolved}/${shiftCases.length}</strong></div>
      <div><span>Clean closes</span><strong>${clean}</strong></div>
      <div class="${slaBreaches ? "warn" : ""}"><span>SLA breaches</span><strong>${slaBreaches}</strong></div>
      <div class="${policy ? "bad" : ""}"><span>Policy violations</span><strong>${policy}</strong></div>
    </div>
    <div class="skill-grid">
      ${skills.map((skill) => `
        <div>
          <span>${skill.label}</span>
          <strong>${skill.score}%</strong>
        </div>
      `).join("")}
    </div>
    <div class="debrief-line">
      <span>Strength</span>
      <p>${narrative.strength}</p>
    </div>
    <div class="debrief-line weak">
      <span>Weak Spot</span>
      <p>${narrative.weakness}</p>
    </div>
    <details class="review-more">
      <summary>Shift details</summary>
      <ul class="summary-list">
        <li>${resolved} of ${shiftCases.length} incidents that arrived during the shift resolved.</li>
        <li>${clean} clean closes, ${risky} risky closes, ${incomplete} incomplete closes, ${policy} policy violations.</li>
        <li>${slaBreaches} SLA breach${slaBreaches === 1 ? "" : "es"} from tickets left waiting past their response target.</li>
        <li>${postponed} ticket${postponed === 1 ? "" : "s"} postponed${stillHeld ? `, ${stillHeld} still on hold when the shift ended` : ""}.</li>
        <li>${followUps} follow-up tickets generated and ${major} major consequence${major === 1 ? "" : "s"} recorded.</li>
        <li>${warningsAcknowledged} pre-close warning${warningsAcknowledged === 1 ? "" : "s"} acknowledged and ${policyWarningsAvoided} policy warning${policyWarningsAvoided === 1 ? "" : "s"} avoided.</li>
        <li>${riskyFollowUps} follow-up ticket${riskyFollowUps === 1 ? "" : "s"} came from risky or policy-violating closes.</li>
        <li>Most repeated risk pattern: ${repeatedPattern ? `${repeatedPattern.label} across ${repeatedPattern.count} incidents` : "No repeated pattern detected"}.</li>
        <li>Best triage call: ${best ? `${best.title} (${best.score})` : "None yet"}.</li>
        <li>Most expensive mistake: ${worst ? `${worst.title} (${worst.quality}, ${worst.severity})` : "None"}.</li>
        <li>Security ${shiftEngine.state.metrics.security}, SLA ${shiftEngine.state.metrics.sla}, Trust ${shiftEngine.state.metrics.trust}, Budget ${shiftEngine.state.metrics.budget}.</li>
      </ul>
    </details>
    <h3>Replay Modifiers</h3>
    <div class="modifier-grid">
      ${replayOptions.map((option) => `
        <button data-modifier="${option.id}" class="modifier-button">
          <strong>${option.label}</strong>
          <span>${option.description}</span>
          <small>Scenario ${option.seed}</small>
        </button>
      `).join("")}
    </div>
  `;
  openModal(els.summaryModal, els.restartGame);
}

function render() {
  const available = availableCases();
  const open = openCases();
  const current = selectedCase();

  els.clock.textContent = formatTime(shiftEngine.state.time);
  els.closedCount.textContent = available.length - open.length;
  els.mobileQueueCount.textContent = open.length ? String(open.length) : "";
  els.openCount.textContent = open.length;

  renderShiftControl(available);
  renderPatternHint(open);
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
  renderActions(current);
  renderDecision(current);
  renderHold(current);
}

function renderHold(item) {
  let label = "Postpone 30m";
  let helper = "Select an open incident.";
  let enabled = false;
  if (item?.onHold) {
    label = "Resume Now";
    helper = `On hold until ${formatTime(item.holdUntil)}. Its SLA clock is paused.`;
    enabled = true;
  } else if (workable(item) && item.holdUsed) {
    helper = "Already postponed once. Work it or close it.";
  } else if (workable(item)) {
    helper = `Parks it for ${HOLD_MINUTES}m and pauses its SLA clock. Costs ${describeHoldCost(holdCostFor(item))}. Once per ticket.`;
    enabled = true;
  } else if (item) {
    helper = "Ticket already resolved.";
  }
  els.holdButton.textContent = label;
  els.holdButton.disabled = !enabled;
  els.holdHelper.textContent = helper;
}

function renderShiftControl(available) {
  const noArrivalsYet = available.length === 0 && shiftEngine.state.time === START_MINUTE;
  els.advanceTime.textContent = noArrivalsYet ? "Start Shift" : "Wait 10m";
  els.advanceTime.title = noArrivalsYet ? "Start shift" : "Wait 10 minutes";
  els.advanceTime.setAttribute("aria-label", els.advanceTime.title);
}

function renderPatternHint(open) {
  const pattern = strongestPattern(open);
  if (!pattern) {
    els.patternHint.classList.add("hidden");
    els.patternHint.innerHTML = "";
    return;
  }

  els.patternHint.classList.remove("hidden");
  els.patternHint.innerHTML = `
    <strong>Possible pattern</strong>
    <span>${pattern.count} open incidents mention ${pattern.label}. Correlate before isolating.</span>
  `;
}

function renderStageBar(item) {
  const stage = currentStage(item);
  els.stageTitle.textContent = stage.title;
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
    els.diagnosisSection,
    els.categorySection,
    els.prioritySection,
    els.actionsPanel,
    els.decisionPanel,
    els.troubleshootSection,
    els.resolutionSection
  ];
  allTargets.forEach((node) => node.classList.remove("stage-focus", "substage-focus", "active-control-focus"));

  if (stage.id === "investigate") {
    els.actionsPanel.classList.add("stage-focus");
    els.evidencePanel.classList.add("substage-focus");
  } else if (stage.id === "classify") {
    els.classificationPanel.classList.add("stage-focus");
    const targetMap = {
      diagnosis: els.diagnosisSection,
      category: els.categorySection,
      priority: els.prioritySection
    };
    targetMap[missingClassificationTarget(item)]?.classList.add("active-control-focus");
  } else if (stage.id === "troubleshoot") {
    els.decisionPanel.classList.add("stage-focus");
    els.troubleshootSection.classList.add("substage-focus");
  } else if (stage.id === "close") {
    els.decisionPanel.classList.add("stage-focus");
    els.resolutionSection.classList.add("substage-focus");
  }
}

function renderChannelStatus(open) {
  const counts = channelStatus
    .map((channel) => ({ ...channel, count: open.filter((item) => item.channel === channel.id).length }))
    .filter((channel) => channel.count);
  els.channelStatus.innerHTML = counts.length
    ? counts.map((channel) => `<span class="channel-chip">${channel.label} <strong>${channel.count}</strong></span>`).join("")
    : "";
}

function slaChipFor(item) {
  if (!item || item.status === "resolved") return null;
  if (item.onHold) return { text: `On hold to ${formatTime(item.holdUntil)}`, tone: "hold" };
  if (item.slaBreached) return { text: "SLA breached", tone: "danger" };
  const left = slaDueMinute(item) - shiftEngine.state.time;
  return { text: `SLA ${left}m`, tone: left <= 10 ? "warn" : "ok" };
}

function slaChipHtml(item) {
  const chip = slaChipFor(item);
  return chip ? `<span class="sla-chip ${chip.tone}">${chip.text}</span>` : "";
}

let closedQueueOpen = false;

function renderQueue(items) {
  if (!items.length) {
    els.queueList.innerHTML = `<p class="queue-meta">Shift not started. Press Start Shift to receive the first call, ticket, chat, alert, or walk-up.</p>`;
    return;
  }

  const { active, closed } = queueOrder(items);
  const nextArrival = futureCases()[0];
  const emptyNote = active.length ? "" : `<p class="queue-meta queue-empty">No open tickets.${nextArrival && !shiftEngine.state.shiftEnded ? ` Next arrival around ${formatTime(nextArrival.arrival)}.` : ""}</p>`;
  const closedGroup = closed.length ? `
    <details class="queue-closed"${closedQueueOpen ? " open" : ""}>
      <summary>Closed (${closed.length})</summary>
      <div class="queue-closed-list">${closed.map(queueItemHtml).join("")}</div>
    </details>
  ` : "";
  els.queueList.innerHTML = emptyNote + active.map(queueItemHtml).join("") + closedGroup;

  els.queueList.querySelector(".queue-closed")?.addEventListener("toggle", (event) => {
    closedQueueOpen = event.target.open;
  });
  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      selectTicket(button.dataset.select);
      setMobileView("ticket");
    });
  });
}

function queueItemHtml(item) {
  const active = item.id === shiftEngine.state.selectedId ? " active" : "";
  const resolved = item.status === "resolved" ? " resolved" : item.onHold ? " on-hold" : "";
  const age = Math.max(0, shiftEngine.state.time - item.arrival);
  const stage = stageLabel(item);
  const warning = item.securityRisk && !item.revealed.includes("verify") && item.status !== "resolved";
  return `
    <button class="queue-item${active}${resolved}" data-select="${item.id}">
      <span class="queue-main">
        <strong>${item.title}</strong>
        <span class="queue-meta">${formatTime(item.arrival)} arrival | ${age}m old | ${item.requester}</span>
        <span class="queue-stage">${slaChipHtml(item)}<span>${stage}${warning ? " | Verify before access changes" : ""}</span></span>
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
}

function renderResources() {
  els.resourceList.innerHTML = Object.entries(shiftEngine.state.resources).map(([, resource]) => {
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

  els.metricList.innerHTML = Object.entries(shiftEngine.state.metrics).map(([key, value]) => {
    const tone = value < 35 ? "danger" : value < 55 ? "warn" : "";
    return `
      <div class="health-item ${tone}" title="${labels[key]} ${value}/100">
        <div class="metric-top"><span class="metric-label">${labels[key]}</span><strong>${value}</strong></div>
        <div class="meter ${tone}"><span style="width:${value}%"></span></div>
      </div>
    `;
  }).join("");
}

function renderFeed() {
  els.feed.innerHTML = shiftEngine.state.feed.slice(0, 18).map((item) => `
    <article class="feed-item ${item.tone} ${item.severity ? `severity-${item.severity.toLowerCase()}` : ""}">
      <span class="feed-time">${formatTime(item.minute)}</span>
      ${item.severity ? `<span class="feed-severity">${item.severity}</span>` : ""}
      ${item.tags?.length ? `<span class="feed-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</span>` : ""}
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderRules() {
  const item = selectedCase();
  const relevant = new Set(relevantRulesFor(item).map((rule) => rule.id));
  const strongestRule = strongestRuleFor(item);
  els.ruleRiskNote.textContent = !item
    ? "Select a ticket to see relevant rules."
    : strongestRule
      ? `Most relevant: ${strongestRule.summary}`
      : "No special policy rule highlighted for this ticket.";

  els.rulesList.innerHTML = activeRules().map((rule) => {
    const relevanceClass = item ? (relevant.has(rule.id) ? "rule-relevant" : "rule-muted") : "";
    const status = item && relevant.has(rule.id) ? `<span class="rule-tag">Relevant</span>` : "";
    return `<li class="${relevanceClass}"><span class="rule-label">${rule.label}</span>${status}<p>${rule.text}</p></li>`;
  }).join("");
}

let caseMemoryOpen = false;

function renderAuditPreview(item) {
  const entries = (item.audit || []).slice(0, 5);
  if (!entries.length) return "No audit entries yet";
  return `<ol class="case-audit case-memory">${entries.map((entry) => `
    <li><span>${formatTime(entry.minute)}</span><strong>${entry.title}</strong><p>${entry.text}</p></li>
  `).join("")}</ol>`;
}

function renderCase(item) {
  if (!item) {
    els.caseTitle.textContent = "Shift not started";
    els.caseSignals.innerHTML = "";
    els.caseStatus.textContent = "Ready";
    els.caseSla.className = "sla-chip hidden";
    els.caseMemory.innerHTML = "";
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
  const slaChip = slaChipFor(item);
  els.caseSla.className = slaChip ? `sla-chip ${slaChip.tone}` : "sla-chip hidden";
  els.caseSla.textContent = slaChip ? slaChip.text : "";
  els.caseFacts.innerHTML = `
    <dt>Requester</dt><dd>${item.requester}</dd>
    <dt>Department</dt><dd>${item.department}</dd>
    <dt>Location</dt><dd>${item.location}</dd>
    <dt>Report</dt><dd>${item.report}</dd>
    ${item.origin ? `<dt>Original Decision</dt><dd>${item.origin.decision} | ${item.origin.quality} | ${item.origin.severity}</dd>` : ""}
    ${Object.entries(item.facts).map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`).join("")}
    <dt>Classification</dt><dd>${item.diagnosis ? labelFor(diagnosisOptions, item.diagnosis) : "Undiagnosed"} | ${item.category ? labelFor(categoryOptions, item.category) : "Uncategorized"} | ${item.priority || "No priority"}</dd>
    <dt>Troubleshooting</dt><dd>${item.troubleshooting.length ? item.troubleshooting.map((step) => labelFor(troubleshootingOptions, step)).join(", ") : "No step chosen"}</dd>
    ${item.quality ? `<dt>Close Review</dt><dd>${item.quality} | ${item.severity} | Score ${item.score}</dd>` : ""}
  `;
  els.caseMemory.innerHTML = `
    <details class="case-memory-group"${caseMemoryOpen ? " open" : ""}>
      <summary>Case memory (${(item.audit || []).length})</summary>
      ${renderAuditPreview(item)}
    </details>
  `;
  els.caseMemory.querySelector("details").addEventListener("toggle", (event) => {
    caseMemoryOpen = event.target.open;
  });

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
  const disabled = !workable(item);
  els.actionHint.textContent = item?.onHold ? "Ticket on hold. Resume it to keep working." : disabled ? "Select an unresolved incident." : "Every action spends shift time.";

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

function renderCloseReadiness(item) {
  const readiness = closeReadinessFor(item);
  els.closeReadiness.className = `decision-readiness ${readiness.tone}`;
  els.closeReadiness.innerHTML = `
    <div class="readiness-head">
      <div>
        <span class="group-label">Close Readiness</span>
        <strong>${readiness.label}</strong>
      </div>
      <p>${readiness.summary}</p>
    </div>
    <div class="readiness-checks">
      ${readiness.checks.map((check) => `<span class="${check.state}">${check.label}</span>`).join("")}
    </div>
  `;
}

function renderDecision(item) {
  const disabled = !workable(item);
  const missingClassification = !item || !item.diagnosis || !item.category || !item.priority;
  const classifyDisabled = !classificationUnlocked(item);
  const classifyTitle = classifyDisabled && !disabled ? ' title="Gather at least one piece of evidence before classifying."' : "";
  const troubleshootDisabled = disabled || missingClassification;
  const resolutionDisabled = troubleshootDisabled || !item.troubleshooting.length;
  const missingNames = requirementItems(item).filter((requirement) => ["diagnosis", "category", "priority"].includes(requirement.id) && !requirement.done).map((requirement) => requirement.label);
  renderCloseReadiness(item);

  if (disabled) {
    const lockedText = item?.onHold ? "Ticket on hold. Resume it to keep working." : item && item.status === "resolved" ? "Ticket already resolved." : "Select an unresolved incident.";
    els.troubleshootHelper.textContent = lockedText;
    els.resolutionHelper.textContent = lockedText;
  } else if (missingClassification) {
    els.troubleshootHelper.textContent = `Classify first: ${missingNames.join(", ")} missing.`;
    els.resolutionHelper.textContent = "Choose troubleshooting before closing.";
  } else if (!item.troubleshooting.length) {
    els.troubleshootHelper.textContent = "Choose at least one concrete troubleshooting step.";
    els.resolutionHelper.textContent = "Final action unlocks after troubleshooting.";
  } else {
    els.troubleshootHelper.textContent = "Troubleshooting selected. Unnecessary extra steps cost time and are marked down in review.";
    els.resolutionHelper.textContent = "Ready to choose the final path.";
  }

  els.diagnosisControl.innerHTML = diagnosisOptions.map((diagnosis) => `
    <button data-diagnosis="${diagnosis.id}" class="${shiftEngine.state.selectedDiagnosis === diagnosis.id ? "selected" : ""}" ${classifyDisabled ? "disabled" : ""}${classifyTitle}>${diagnosis.label}</button>
  `).join("");

  els.categoryControl.innerHTML = categoryOptions.map((category) => `
    <button data-category="${category.id}" class="${shiftEngine.state.selectedCategory === category.id ? "selected" : ""}" ${classifyDisabled ? "disabled" : ""}${classifyTitle}>${category.label}</button>
  `).join("");

  els.priorityControl.innerHTML = priorities.map((priority) => `
    <button data-priority="${priority}" class="${shiftEngine.state.selectedPriority === priority ? "selected" : ""}" ${classifyDisabled ? "disabled" : ""}${classifyTitle}>${priority}</button>
  `).join("");

  els.troubleshootControl.innerHTML = troubleshootingOptions.map((step) => `
    <button data-troubleshoot="${step.id}" class="${shiftEngine.state.selectedTroubleshooting.includes(step.id) ? "selected" : ""}" ${troubleshootDisabled ? "disabled" : ""}>
      ${step.label}
      <small>${item?.troubleshootingPerformed?.includes(step.id) ? "Done" : `${step.cost}m`}</small>
    </button>
  `).join("");

  els.resolutionGrid.innerHTML = resolutionOptions.map((option) => {
    const hint = finalActionHintFor(item, option, resolutionDisabled);
    return `
      <button class="resolution-button ${hint.tone}" data-resolution="${option.id}" title="${hint.text}" ${resolutionDisabled || resourceExhausted(option) ? "disabled" : ""}>
        ${option.label}
        <small>${option.cost}m${option.resource ? ` | ${shiftEngine.state.resources[option.resource].remaining} left` : ""}</small>
        ${resolutionDisabled ? "" : `<span class="resolution-risk ${hint.tone}">${hint.text}</span>`}
      </button>
    `;
  }).join("");

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
    button.addEventListener("click", () => requestResolve(button.dataset.resolution));
  });
}

els.endShift.addEventListener("click", endShift);
els.restartGame.addEventListener("click", () => restartGame("standard"));
els.summaryBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-modifier]");
  if (button) {
    restartGame(button.dataset.modifier);
  }
});
els.ackCloseReview.addEventListener("click", hideCloseReview);
els.cancelCloseWarning.addEventListener("click", hideCloseWarning);
els.confirmCloseWarning.addEventListener("click", () => {
  confirmCloseWarning();
  hideCloseWarning();
});
document.addEventListener("keydown", handleModalKeys);
document.querySelectorAll(".mobile-tabs [data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setMobileView(button.dataset.view);
    window.scrollTo({ top: 0 });
  });
});
const topbar = document.querySelector(".topbar");
const actionBar = document.querySelector(".next-action-bar");
new ResizeObserver(() => {
  document.documentElement.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`);
  document.documentElement.style.setProperty("--actionbar-h", `${actionBar.offsetHeight}px`);
}).observe(topbar);
new ResizeObserver(() => {
  document.documentElement.style.setProperty("--actionbar-h", `${actionBar.offsetHeight}px`);
}).observe(actionBar);
els.holdButton.addEventListener("click", () => {
  if (selectedCase()?.onHold) resumeCurrent();
  else postponeCurrent();
});
els.nextActionButton.addEventListener("click", () => jumpToTarget(els.nextActionButton.dataset.target));


els.advanceTime.addEventListener("click", waitForWork);
shiftEngine.subscribe((type, detail) => {
  if (type === "change") render();
  if (type === "warning") showCloseWarning(detail.resolutionId, detail.readiness);
  if (type === "review") showCloseReview(detail);
  if (type === "summary") {
    hideCloseWarning();
    hideCloseReview();
    departmentView.show();
    showSummary();
  }
  if (type === "restart") {
    hideCloseWarning();
    hideCloseReview();
    closeModal(els.summaryModal);
    departmentView.show();
  }
});
render();
})();

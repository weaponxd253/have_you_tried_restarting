# Have You Tried Restarting?

A browser-based help-desk triage and investigation game.

The player works a live shift where tickets, phone calls, chat messages, monitoring alerts, and walk-up requests arrive over time. Each incident follows a help-desk loop:

1. Ticket arrives.
2. Review user, device, department, symptoms, and history.
3. Ask questions or run diagnostic tools.
4. Assign priority and category.
5. Choose troubleshooting steps.
6. Resolve, escalate, dispatch, deny, or postpone.
7. Receive consequences and follow-up tickets.

Each choice spends shift time, consumes limited resources, and affects trust, security posture, SLA health, and budget.

The current layout emphasizes the active ticket stage, with classification visible above the fold, compact channel pressure, and follow-up work returning to the live queue.

Gameplay readability features include queue signal tags, active-ticket risk lens, evidence progress, requirement status chips, clearer disabled-control hints, and richer investigation feedback.

Consequence features include close-review audits, quality and severity ratings, severity-weighted metric fallout, specific follow-up tickets linked to original decisions, and a shift summary that reports clean closes, risky closes, policy violations, major consequences, and best/worst triage calls.

Polish and responsive UX features include a sticky next-action bar, jump-to-section guidance, active-stage panel highlights, classification controls before the risk lens, container-query workbench layouts, earlier sidebar collapse, and reduced nested scrolling on narrower screens.

Guidance and policy features include exact next-control jumps for diagnosis, category, priority, troubleshooting, and closing, plus contextual rule highlighting that calls out the policy most relevant to the selected incident and cites broken rules in close reviews.

Decision-readiness features include close-readiness chips, final-action risk hints, pre-close warnings for dangerous decisions, and close reviews that repeat the warnings the player saw before committing.

Shift-memory features include compact case memory, tagged supervisor feed events, clearer follow-up provenance, queue-level pattern hints, consequence reason lines, and a final summary that reports warnings, risky follow-ups, and repeated risk patterns.

Learning and replay features include one-line supervisor debrief lessons, derived skill tracking, end-of-shift strengths and weak spots, deterministic shift seeds, and replay modifiers for security-heavy, outage-heavy, or lean-staffing shifts.

Open `index.html` in a browser to play the current prototype.

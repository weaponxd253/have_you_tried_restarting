# Have You Tried Restarting?

A browser-based help-desk investigation game.

The player works a live shift where tickets, phone calls, chat messages, monitoring alerts, and walk-up requests arrive over time. Each incident follows a help-desk loop:

1. Ticket arrives.
2. Review user, device, department, symptoms, and history.
3. Ask questions or run diagnostic tools.
4. Assign priority and category.
5. Choose troubleshooting steps.
6. Resolve, escalate, dispatch, deny, close it as monitored, or postpone it.
7. Receive consequences and follow-up tickets.

Each choice spends shift time, consumes limited resources, and affects trust, security posture, SLA health, and budget.

The shift ends automatically at 12:00. Every open ticket has a response target based on its SLA risk (Critical 30m, Rising 60m, Low 90m); letting it wait past that target costs SLA health and user trust. Extra troubleshooting steps that do not address the cause are marked down in the close review. Postponing puts a ticket on hold for 30 minutes (once per ticket): it stays open, its SLA clock pauses, and it returns to the queue on its own or when resumed. Each postpone costs a little user trust, and parking Critical or security-sensitive work costs SLA and security posture too. Classification unlocks after the first investigation step, and a correct diagnosis or priority only earns full credit when the gathered evidence backs it (diagnostics or follow-up questions for diagnosis, records or diagnostics for priority).

The layout keeps feedback in view while you work: shift health meters sit in a sticky header, the supervisor feed stays pinned beside the workbench, and a single sticky bar shows the current stage, requirements, and next action. The workbench follows the order of the job (report and evidence, investigation, classification, then troubleshoot and close), and the live queue lists open work by soonest SLA deadline with closed tickets folded away.

Gameplay readability features include queue signal tags, active-ticket risk lens, evidence progress, requirement status chips, clearer disabled-control hints, and richer investigation feedback.

Consequence features include close-review audits, quality and severity ratings, severity-weighted metric fallout, specific follow-up tickets linked to original decisions, and a shift summary that reports clean closes, risky closes, policy violations, major consequences, and best/worst triage calls.

Polish and responsive UX features include a sticky next-action bar, jump-to-section guidance, active-stage panel highlights, classification controls before the risk lens, container-query workbench layouts, earlier sidebar collapse, and reduced nested scrolling on narrower screens.

Guidance and policy features include exact next-control jumps for diagnosis, category, priority, troubleshooting, and closing, plus contextual rule highlighting that calls out the policy most relevant to the selected incident and cites broken rules in close reviews.

Decision-readiness features include close-readiness chips, final-action risk hints, pre-close warnings for dangerous decisions, and close reviews that repeat the warnings the player saw before committing.

Shift-memory features include compact case memory, tagged supervisor feed events, clearer follow-up provenance, queue-level pattern hints, consequence reason lines, and a final summary that reports warnings, risky follow-ups, and repeated risk patterns.

Learning and replay features include one-line supervisor debrief lessons, derived skill tracking, end-of-shift strengths and weak spots, and replay modifiers for security-heavy, outage-heavy, or lean-staffing shifts. Every shift is a fixed, repeatable scenario identified by a scenario code; there is no randomness.

Open `index.html` in a browser to play the current prototype.

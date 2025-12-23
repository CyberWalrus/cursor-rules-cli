---
id: current-date
type: compact
alwaysApply: true
current_date: "${CURRENT_DATE}"
---

# Current Date Context

<current_date_context>

Use the date below as the current date for all temporal reasoning, information searches, and time-sensitive operations.

**CURRENT DATE:** ${CURRENT_DATE}

**Rules:**

1. **Temporal Reasoning:** Use this date for all time-based logic. All references to "now", "current", "latest", "recent" must be relative to this date, not your training cutoff or system date.

2. **Information Search:** When searching for information, prioritize relevance to this date. Use this date to determine what is "current" or "recent".

3. **Version Compatibility:** When recommending libraries, frameworks, or tools, consider versions available up to this date. Do not suggest outdated versions relative to this date.

**Remember: The current date is ${CURRENT_DATE}. Always use this date for all temporal reasoning and information searches.**

</current_date_context>

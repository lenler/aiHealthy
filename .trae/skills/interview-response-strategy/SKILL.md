
---
name: "interview-response-strategy"
description: "Guides responses to interview questions on architecture, code, and scenarios. Invoke when user asks for interview prep, system design explanation, or coding challenge strategy."
---

# Interview Response Strategy

This skill helps formulate high-quality, senior-level responses to technical interview questions. It focuses on structuring answers that demonstrate architectural thinking, trade-off analysis, and clear communication.

## Core Strategy: The "Three-Layer" Response

When answering technical questions, especially about system design or complex features, structure the response into three layers:

1.  **Current Implementation (The "What" & "How")**:
    *   Directly answer the question based on the actual project code.
    *   Highlight specific technologies and patterns used (e.g., "I used Zustand for state management...").
    *   Explain the *why* behind these choices briefly.

2.  **Limitations & Trade-offs (The "Why Not" & "Realism")**:
    *   Acknowledge the constraints of the current solution.
    *   Be honest about what it *doesn't* handle (e.g., "This works for single-page apps but doesn't handle cross-tab synchronization...").
    *   This shows maturity and that you understand the boundaries of your code.

3.  **Future Optimization / Architectural Vision (The "Seniority")**:
    *   Propose how you would scale or improve it given more time/resources.
    *   Mention advanced patterns or technologies (e.g., "For a larger scale, I'd move to a server-sent events model...").
    *   This demonstrates you can think beyond the immediate task.

## Key Scenarios & Templates

### Scenario 1: State Management Choice (e.g., Zustand vs. Redux)
*   **Template**: "I chose [Library] because [Reason 1: Simplicity/Performance] and [Reason 2: Specific Feature like Async]. Unlike [Alternative A], it avoids [Problem A]. For this project size, [Alternative B] would be overkill/underpowered."
*   **Keywords**: Boilerplate, Granular Re-renders, Bundle Size, Learning Curve, Async Handling.

### Scenario 2: Handling Edge Cases (e.g., Network Interruptions)
*   **Template**: "I implemented a multi-layered defense: UI locking to prevent double-clicks, Request interception for deduplication, and System-level alerts for accidental closures. While this covers 90% of cases, for critical data consistency, I'd add [Advanced Solution like Server-Side Idempotency]."
*   **Keywords**: Idempotency, Optimistic UI, Race Conditions, Cleanup Functions, AbortController.

### Scenario 3: Performance Optimization
*   **Template**: "I optimized by [Technique 1: Memoization/Virtualization] and [Technique 2: Code Splitting]. I verified this using [Tool: Profiler/Lighthouse]. A trade-off was [Complexity/Memory], but it was worth it for [Metric: TTI/LCP]."
*   **Keywords**: Memoization, Lazy Loading, Virtualization, Bundle Analysis, Critical Rendering Path.

## General Tips for "Talking to the Interviewer"

*   **Be Specific**: Don't just say "state management"; say "Zustand with selector-based subscriptions."
*   **Quantify Impact**: "This reduced boilerplate by 40%" or "This prevents 99% of duplicate requests."
*   **Own the Code**: Use "I decided," "I implemented," "I chose." Avoid passive voice.
*   **Invite Discussion**: End with "Does that align with how your team handles X?" or "I'd be happy to dive deeper into the code for Y."

# Groq migration QA — 27 October 2026

The salon assistant now uses Groq Chat Completions with GROQ_API_KEY and GROQ_MODEL (default openai/gpt-oss-20b). OPENAI_API_KEY and OPENAI_MODEL are no longer read by the app.

Implemented:

- Groq endpoint and system/user messages request format.
- Final-answer extraction from choices[0].message.content; reasoning is excluded from the client response.
- Low reasoning effort, a 1,024-token completion ceiling, concise plain-text answers and a 20-second timeout.
- FAQ fallback for missing keys, invalid credentials, quota/rate limits, provider failures and unusable responses.
- Fixed safe error reasons; upstream error text and credentials never reach the browser.
- Updated .env.example, README and npm run check:ai for Groq.
- Existing environment values were preserved; new Groq variables were added without copying the old OpenAI credential to Groq.

Verification:

- npm test: 30 reported tests pass, including the exact Groq URL, model, authorization format, message schema, completion limit and reasoning exclusion.
- The saved Groq key passed a small real request using npm run check:ai.
- A mobile browser question about Sunday hours returned a live response through the production app with AI mode active.
- Production build succeeds.

No account/billing plan was changed. Actual provider quotas are determined by the user's Groq account. The FAQ fallback remains available when those limits are reached.

Provider references: https://console.groq.com/docs/api-reference and https://console.groq.com/docs/model/openai/gpt-oss-20b

Final HTTP verification: 27 checks passed on the Groq-enabled production build. The final mobile browser response uses plain text, runs in AI mode and produces no browser warning/error logs. Evidence: [live mobile reply](groq-live-mobile.png).

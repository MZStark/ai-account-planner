# AI Account Planner

> **Simulation tool built for application purposes.** Built on OpenAI's GPT-6.2 models through the Responses API. Personal project, not affiliated with OpenAI or any company shown.

**Type a company's name. Get a sourced AI account strategy: its priorities, its AI maturity, the use cases worth pursuing, who decides, and how usage grows over 12 months.**

[**Live demo →**](https://REPLACE-ME.vercel.app) · [What you get](#what-you-get) · [Method](#method) · [Run it](#run-it)

<!-- Add a 30-second screen recording here: docs/demo.gif -->

---

## The problem

An Account Director owns a dozen key accounts. For each one, the questions are the same:

- What is this company trying to achieve, and where does AI fit?
- Which teams would get the most value, and what is realistic first?
- Who decides, who champions, who can block?
- How does usage grow after the first deal, and how will leadership measure impact?

Answering them takes hours of reading, and most AI research tools answer fast but invent freely. This planner does the research and refuses to invent.

## What you get

| Section | Type | Content |
|---|---|---|
| Snapshot | Sourced fact | Business, size, funding, markets, recent news |
| AI maturity | Sourced fact | Exploring, Piloting, Scaling or AI-native, with evidence |
| Strategic priorities | Sourced fact | What the company is publicly trying to achieve |
| Use-case portfolio | Hypothesis | 5 to 7 use cases across teams, mapped to API, ChatGPT Enterprise or Codex, on a value × feasibility matrix, each tied to a priority |
| Stakeholder map | Hypothesis | Economic buyer, champion, technical evaluator, gatekeeper: what each cares about and the angle to take |
| Adoption and impact | Hypothesis | Governance, and the metrics leadership will track |
| 12-month expansion plan | Hypothesis | Land, expand, scale, and the trigger for each step |
| Risks | Hypothesis | Blockers and mitigations |
| Questions to validate | — | What the account team must confirm |
| 30 / 60 / 90-day plan | — | Concrete actions |
| Sources | — | Every URL the strategy relies on |

Strategies export to Markdown and PDF.

## Method

1. **Facts and hypotheses apart.** Facts carry a source. Hypotheses are labelled and tied to a strategic priority. The interface colours them differently.
2. **Priorities before products.** Every use case starts from something the company is trying to achieve, not from a product catalogue.
3. **Adoption and impact.** The signature is the start. Each strategy defines governance, impact metrics and the path from land to scale.
4. **Roles, never names.** The planner never invents a contact, a number or a customer.

## How it works

```
company ─▶ OpenAI Responses API ─▶ web search ─▶ strict JSON schema ─▶ account strategy
               + account playbook (prompts/system.md)
```

| File | Role |
|---|---|
| `index.html`, `styles.css`, `app.js` | Web app. No framework, no build step |
| `api/plan.js` | Serverless function calling the Responses API, with an optional access code, a per-IP rate limit and a cache. The API key stays server-side |
| `schema.json` | Strategy structure, enforced with strict structured outputs |
| `prompts/system.md` | The account playbook the model follows |
| `planner.py` | Command line to pre-generate strategies (Python standard library only) |
| `data/` | Example companies, generated strategies and a fictional demo |

Zero dependencies: no `npm install`, no `pip install`.

## Run it

**Pre-generate the examples**

```bash
export OPENAI_API_KEY=sk-...
python planner.py --examples        # Doctolib, Back Market, Qonto → data/plans/
python -m http.server 8000          # open http://localhost:8000
```

**Deploy with live generation (Vercel)**

1. Import the repository in Vercel.
2. Add `OPENAI_API_KEY` in Project Settings → Environment Variables. Recommended: `ACCESS_CODE` so only people you share it with can run live generation. Optional: `OPENAI_MODEL` (default `gpt-6.2-sol`), `RATE_LIMIT_PER_HOUR`.
3. Deploy.

## Limits

- Public sources only: it cannot see what a company already buys.
- Hypotheses are starting points for discovery. Check every source before use.
- The demo strategy (Nova Rail) is fictional and labelled as such.

---

Built by Mehdi Zerraf. MIT License.

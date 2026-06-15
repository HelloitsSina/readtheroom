import { BASE_PROMPT } from '../data/defaultRoles.js'
import { getApiKey } from './apiKey.js'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

// ── System prompt builders ────────────────────────────────────────────────────

function buildCharacterBlock(role) {
  if (role.isPersona) {
    return `You are now roleplaying as ${role.title}. Based on everything known about this person, respond exactly as they would.

Here is what we know about ${role.title}:
- Communication style: ${role.communicationStyle}
- Core priorities: ${role.priorities?.join(', ')}
- Typical objections: ${role.likelyObjections?.join('; ')}
- They respond well to: ${role.respondsWellTo?.join('; ')}
- Watch out for: ${role.watchOutFor?.join('; ')}

Stay in character. Respond as ${role.title} would, using their actual communication style and concerns.`
  }
  return role.systemPrompt || ''
}

function extraContextBlock(role) {
  if (!role.extraContext?.trim()) return ''
  return `\n\nADDITIONAL CONTEXT about this specific person:\n${role.extraContext}`
}

// INITIAL response: structured format with bold labels
function buildInitialSystemPrompt(role) {
  const character = buildCharacterBlock(role)
  const extra = extraContextBlock(role)

  const labels = role.isPersona
    ? (role.priorities?.slice(0, 3).map(p => p.toUpperCase()) || ['PRIORITY', 'CONCERN', 'QUESTION'])
    : (role.initialLabels || ['CONCERN', 'RISK', 'QUESTION'])

  const labelExample = labels.map(l => `**${l}:** [specific concern or observation]`).join('\n')

  return `You are participating in a workplace conversation simulation set in an Australian corporate environment.
A user is preparing for an important conversation and you are responding in character.
${character}${extra}

RESPONSE FORMAT FOR THIS INITIAL REACTION:
1. One sentence opening that conveys your gut reaction in your authentic voice.
2. Exactly 2-3 bullet lines, each formatted as: **LABEL:** specific concern or observation
   Use these labels (drawn from your evaluation focus): ${labels.join(', ')}
3. Optional: one closing sentence that is a direct question or a "what I need to see" statement.

Example structure:
[Opening sentence gut reaction.]

${labelExample}

[Optional closing question or what you need to see.]

RULES:
- Total response must be under 150 words
- The opening and closing are plain sentences, NOT bullet points
- Bold labels must be ALL CAPS followed by a colon
- Be specific to the actual proposal content, not generic
- Australian workplace tone
- Do not use em dashes. Use a period or colon instead
- Do not offer to help -- you are evaluating`
}

// FOLLOW-UP: natural prose
function buildFollowUpSystemPrompt(role) {
  const character = buildCharacterBlock(role)
  const extra = extraContextBlock(role)
  return `${BASE_PROMPT}\n\n${character}${extra}`
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function callAnthropic(systemPrompt, messages, maxTokens = 400) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    // 401 = invalid key
    if (response.status === 401) throw new Error('INVALID_API_KEY')
    throw new Error(data.error?.message || `API error: ${response.status}`)
  }

  return data.content?.[0]?.text || ''
}

// ── Exported API functions ────────────────────────────────────────────────────

export async function getInitialResponse(role, proposal, scenarioType) {
  const scenarioLine = scenarioType && scenarioType !== 'Other'
    ? `\nScenario type: ${scenarioType}` : ''
  return callAnthropic(
    buildInitialSystemPrompt(role),
    [{ role: 'user', content: `Here is what I am preparing for:${scenarioLine}\n\n${proposal}` }]
  )
}

export async function getContinuedResponse(role, proposal, conversationHistory, scenarioType) {
  const scenarioLine = scenarioType && scenarioType !== 'Other'
    ? `\nScenario type: ${scenarioType}` : ''
  return callAnthropic(
    buildFollowUpSystemPrompt(role),
    [
      { role: 'user', content: `Here is what I am preparing for:${scenarioLine}\n\n${proposal}` },
      ...conversationHistory,
    ]
  )
}

export async function extractPersona({ name, role, rawNotes, calibration }) {
  const calibrationSection = calibration
    ? `\n\nCALIBRATION NOTE: the user observed this unexpected reaction from ${name}:\n"${calibration}"\nUpdate the persona accordingly, especially likelyObjections and watchOutFor.`
    : ''

  const prompt = `You are building a persona profile for workplace conversation prep.

Based on the raw context below, extract a structured persona for ${name || 'this person'}${role ? ` (${role})` : ''}.

RAW CONTEXT:
${rawNotes}
${calibrationSection}

Return ONLY valid JSON in this exact structure, no markdown, no explanation:
{
  "communicationStyle": "1-2 sentences describing how they communicate",
  "priorities": ["priority 1", "priority 2", "priority 3"],
  "likelyObjections": ["objection 1", "objection 2", "objection 3"],
  "respondsWellTo": ["approach 1", "approach 2"],
  "watchOutFor": ["watch out 1", "watch out 2"]
}`

  const text = await callAnthropic(
    'You extract structured persona profiles from raw context. Return only valid JSON.',
    [{ role: 'user', content: prompt }],
    800
  )

  return JSON.parse(text)
}

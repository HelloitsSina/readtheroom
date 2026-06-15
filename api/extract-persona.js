// Vercel serverless function — extracts a structured persona from raw context text
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { name, role, rawNotes, calibration } = req.body
  if (!rawNotes) {
    return res.status(400).json({ error: 'Missing rawNotes' })
  }

  const calibrationSection = calibration
    ? `\n\nCALIBRATION NOTE — the user has observed this unexpected real-world reaction from ${name}:\n"${calibration}"\nUse this to update the persona, especially likelyObjections and watchOutFor.`
    : ''

  const prompt = `You are building a persona profile for use in workplace conversation prep.

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' })
    }

    const text = data.content?.[0]?.text || ''
    const parsed = JSON.parse(text)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/*
  GitHub activity proxy.

  Runs server-side for two reasons: the contribution calendar is only exposed
  through GitHub's GraphQL API, which requires authentication at all, and
  proxying keeps the token out of the client bundle. Responses are cached at
  the edge so a burst of visitors costs one upstream call, not hundreds.
*/

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const USERNAME = 'Atul013'

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      followers { totalCount }
      repositories(privacy: PUBLIC) { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    // Not fatal: the client treats this as "no data" and hides the section.
    return res.status(503).json({ error: 'GITHUB_TOKEN is not configured' })
  }

  try {
    const upstream = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'icarus13.in',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
    })

    if (!upstream.ok) {
      return res.status(502).json({ error: `GitHub responded ${upstream.status}` })
    }

    const json = await upstream.json()
    if (json.errors?.length) {
      return res.status(502).json({ error: json.errors[0].message })
    }

    const user = json.data?.user
    if (!user) return res.status(404).json({ error: 'User not found' })

    const cc = user.contributionsCollection
    const cal = cc.contributionCalendar

    // Flatten to just what the UI needs, so the client isn't parsing GraphQL shapes.
    const payload = {
      login: user.login,
      name: user.name,
      avatar: user.avatarUrl,
      followers: user.followers.totalCount,
      publicRepos: user.repositories.totalCount,
      totalContributions: cal.totalContributions,
      commits: cc.totalCommitContributions,
      pullRequests: cc.totalPullRequestContributions,
      reposContributedTo: cc.totalRepositoriesWithContributedCommits,
      weeks: cal.weeks.map(w =>
        w.contributionDays.map(d => ({
          date: d.date,
          count: d.contributionCount,
          // NONE | FIRST_QUARTILE | ... -> 0..4, so the client maps to opacity directly.
          level: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']
            .indexOf(d.contributionLevel),
        }))
      ),
    }

    // Contribution data changes at most a few times a day. One hour fresh,
    // one day stale-while-revalidate: visitors never wait on GitHub.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(payload)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach GitHub' })
  }
}

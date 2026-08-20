export function extractHomestuckAssetOrdinalsFromText(content: string): number[] {
  const values = new Set<number>()
  const patterns = [
    /storyfiles\/hs2\/(\d{5})(?=\D|$)/gi,
    /\/panels\/(?:[^/\s"'\[\]]+\/)*(\d{5})(?=\D|$)/gi,
  ]
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const ordinal = Number(match[1])
      if (Number.isInteger(ordinal) && ordinal >= 1 && ordinal <= 8130) values.add(ordinal)
    }
  }
  return [...values].sort((left, right) => left - right)
}

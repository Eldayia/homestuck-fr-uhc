import { DistributionBlockedError } from "../domain/errors.js"
import type { DistributionPolicy } from "../domain/types.js"

export function assertContentDistributionAllowed(policy: DistributionPolicy): void {
  if (
    !policy.contentDistributionAllowed
    || policy.mode !== "content"
    || policy.decision.status !== "authorized"
  ) {
    throw new DistributionBlockedError(
      "La création d'une archive contenant la traduction est bloquée: aucune autorisation de redistribution n'est enregistrée.",
    )
  }
  if (policy.decision.reference === null || policy.decision.reference.trim() === "") {
    throw new DistributionBlockedError(
      "La politique autorise le contenu mais ne référence aucune décision humaine vérifiable.",
    )
  }
  if (policy.decision.decidedAt === null || !isIsoDate(policy.decision.decidedAt)) {
    throw new DistributionBlockedError(
      "La politique autorise le contenu mais ne contient aucune date de décision ISO valide.",
    )
  }
  if (!policy.decision.scope.includes("translation-text")) {
    throw new DistributionBlockedError(
      "L'autorisation enregistrée ne couvre pas le texte de la traduction.",
    )
  }
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

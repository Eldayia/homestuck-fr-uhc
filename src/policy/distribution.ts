import { DistributionBlockedError } from "../domain/errors.js"
import type { DistributionPolicy } from "../domain/types.js"

export function assertContentDistributionAllowed(policy: DistributionPolicy): void {
  if (!policy.contentDistributionAllowed) {
    throw new DistributionBlockedError(
      "La création d'une archive contenant la traduction est bloquée: aucune autorisation de redistribution n'est enregistrée.",
    )
  }
  if (policy.decisionReference === null || policy.decisionReference.trim() === "") {
    throw new DistributionBlockedError(
      "La politique autorise le contenu mais ne référence aucune décision humaine vérifiable.",
    )
  }
}

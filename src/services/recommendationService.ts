import { Truck, ShipmentSearchCriteria, ScoredTruckMatch, RecommendationResultSet, RecommendationTab } from '../types/logistics';
import { scoreTruck } from './matchingService';

/**
 * Evaluates all eligible trucks and ranks them into Best Value, Fastest, and Cheapest categories
 */
export function generateRecommendations(
  eligibleTrucks: Truck[],
  criteria: ShipmentSearchCriteria,
  activeTab: RecommendationTab = 'best_value'
): RecommendationResultSet {
  if (!eligibleTrucks || eligibleTrucks.length === 0) {
    return {
      bestValue: [],
      fastest: [],
      cheapest: [],
      topRecommendation: null as any,
      activeTab,
      criteria
    };
  }

  // 1. Score all eligible trucks
  const scoredMatches: ScoredTruckMatch[] = eligibleTrucks.map(truck => scoreTruck(truck, criteria));

  // 2. Rank for 🥇 BEST VALUE (Highest Composite Score & Balanced Savings)
  const bestValue = [...scoredMatches].sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    return a.pricing.sharedCapacityEstimateRs - b.pricing.sharedCapacityEstimateRs;
  }).map((match, idx) => ({
    ...match,
    rank: idx + 1,
    recommendationTag: idx === 0 ? ('🥇 BEST VALUE' as const) : undefined
  }));

  // 3. Rank for ⚡ FASTEST (Lowest ETA / Earliest Arrival)
  const fastest = [...scoredMatches].sort((a, b) => {
    const etaA = a.truck.nextHubEtaMinutes || a.truck.eta || 999;
    const etaB = b.truck.nextHubEtaMinutes || b.truck.eta || 999;
    if (etaA !== etaB) return etaA - etaB;
    return b.compositeScore - a.compositeScore;
  }).map((match, idx) => ({
    ...match,
    rank: idx + 1,
    recommendationTag: idx === 0 ? ('⚡ FASTEST' as const) : undefined
  }));

  // 4. Rank for 💰 CHEAPEST (Lowest Shared Capacity Price)
  const cheapest = [...scoredMatches].sort((a, b) => {
    if (a.pricing.sharedCapacityEstimateRs !== b.pricing.sharedCapacityEstimateRs) {
      return a.pricing.sharedCapacityEstimateRs - b.pricing.sharedCapacityEstimateRs;
    }
    return b.compositeScore - a.compositeScore;
  }).map((match, idx) => ({
    ...match,
    rank: idx + 1,
    recommendationTag: idx === 0 ? ('💰 CHEAPEST' as const) : undefined
  }));

  const topRecommendation = activeTab === 'fastest'
    ? fastest[0]
    : activeTab === 'cheapest'
      ? cheapest[0]
      : bestValue[0];

  return {
    bestValue,
    fastest,
    cheapest,
    topRecommendation,
    activeTab,
    criteria
  };
}

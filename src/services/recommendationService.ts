import { Truck, ShipmentSearchCriteria, ScoredTruckMatch, RecommendationResultSet, RecommendationTab, LogisticsHub } from '../types/logistics';
import { scoreTruck } from './matchingService';
import { recommendRouteLockedHubsForTruck } from './hubMatchingService';

/**
 * Evaluates all eligible trucks and ranks them into Best Value, Fastest, and Cheapest categories.
 * Attaches verified origin-side pickup hubs and destination delivery hubs.
 */
export function generateRecommendations(
  eligibleTrucks: Truck[],
  criteria: ShipmentSearchCriteria,
  availableHubs: LogisticsHub[] = [],
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

  // 1. Score all eligible trucks and attach origin-locked pickup hubs
  const scoredMatches: ScoredTruckMatch[] = eligibleTrucks.map(truck => {
    const baseMatch = scoreTruck(truck, criteria);
    const hubRec = recommendRouteLockedHubsForTruck(truck, criteria, availableHubs);
    return {
      ...baseMatch,
      hubRecommendation: hubRec
    };
  });

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

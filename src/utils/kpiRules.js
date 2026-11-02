// src/utils/kpiRules.js
// 10 Key Performance Indicators (KPI) Engine for MetaSync by FatherLab
// Calculates actuals, dynamic targets based on base_price (Harga Jual), and evaluation rules.

import { formatIDR, formatPercent } from './currency';

/**
 * Compute the 10 KPIs for a campaign or adset given base_price and aggregated metrics
 * @param {Object} metrics - { spend, impressions, clicks, lpv, atc, ic, purchases, revenue, reach, frequency }
 * @param {number} basePrice - Harga Jual Item
 * @param {number} cogs - HPP
 */
export function calculate10KPIs(metrics, basePrice = 0, cogs = 0) {
  const spend = Number(metrics.spend || 0);
  const impressions = Number(metrics.impressions || 0);
  const clicks = Number(metrics.clicks || 0);
  const lpv = Number(metrics.lpv || 0);
  const atc = Number(metrics.atc || 0);
  const ic = Number(metrics.ic || 0);
  const purchases = Number(metrics.purchases || 0);
  const revenue = Number(metrics.revenue || (purchases * basePrice));
  const reach = Number(metrics.reach || (impressions > 0 ? Math.round(impressions * 0.8) : 0));
  const rawFrequency = Number(metrics.frequency || (reach > 0 ? impressions / reach : 1.0));

  // 1. CTR: (clicks / impressions) * 100
  const ctrVal = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const ctrTarget = 2.0; // > 2.0%
  const ctrStatus = ctrVal >= ctrTarget ? 'pass' : (ctrVal >= 1.5 ? 'warning' : 'fail');

  // 2. CPC: spend / clicks
  const cpcVal = clicks > 0 ? spend / clicks : (spend > 0 ? spend : 0);
  const cpcTarget = basePrice * 0.01; // Target: 1% x Harga Jual
  const cpcStatus = cpcVal <= cpcTarget ? 'pass' : (cpcVal <= cpcTarget * 1.3 ? 'warning' : 'fail');

  // 3. LC to LPV: (lpv / clicks) * 100
  const lcToLpvVal = clicks > 0 ? (lpv / clicks) * 100 : 0;
  const lcToLpvTarget = 80.0; // Target: 80%
  const lcToLpvStatus = lcToLpvVal >= lcToLpvTarget ? 'pass' : (lcToLpvVal >= 70.0 ? 'warning' : 'fail');

  // 4. Cost LPV: spend / lpv
  const costLpvVal = lpv > 0 ? spend / lpv : (spend > 0 ? spend : 0);
  const costLpvTargetMin = basePrice * 0.02; // 2%
  const costLpvTargetMax = basePrice * 0.03; // Target: 2-3% x Harga Jual
  const costLpvStatus = costLpvVal <= costLpvTargetMax ? 'pass' : (costLpvVal <= costLpvTargetMax * 1.4 ? 'warning' : 'fail');

  // 5. CPM: (spend / impressions) * 1000
  const cpmVal = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const cpmTarget = 32000; // Target: Rp32.000
  const cpmStatus = cpmVal <= cpmTarget ? 'pass' : (cpmVal <= 42000 ? 'warning' : 'fail');

  // 6. LPV to ATC: (atc / lpv) * 100
  const lpvToAtcVal = lpv > 0 ? (atc / lpv) * 100 : 0;
  const lpvToAtcTarget = 40.0; // Target: 40%
  const lpvToAtcStatus = lpvToAtcVal >= lpvToAtcTarget ? 'pass' : (lpvToAtcVal >= 30.0 ? 'warning' : 'fail');

  // 7. ATC to IC: (ic / atc) * 100
  const atcToIcVal = atc > 0 ? (ic / atc) * 100 : 0;
  const atcToIcTarget = 30.0; // Target: 30%
  const atcToIcStatus = atcToIcVal >= atcToIcTarget ? 'pass' : (atcToIcVal >= 22.0 ? 'warning' : 'fail');

  // 8. CPR: spend / purchases
  const cprVal = purchases > 0 ? spend / purchases : (spend > 0 ? spend : 0);
  const cprTarget = basePrice * 0.25; // Target: 25% x Harga Jual
  let cprStatus = 'fail';
  if (purchases > 0) {
    cprStatus = cprVal <= cprTarget ? 'pass' : (cprVal <= cprTarget * 1.25 ? 'warning' : 'fail');
  } else {
    // If 0 purchases and spend already exceeds CPR target
    cprStatus = spend >= cprTarget ? 'fail' : 'warning';
  }

  // 9. Closing Rate: (purchases / ic) * 100
  const closingRateVal = ic > 0 ? (purchases / ic) * 100 : (purchases > 0 ? 100 : 0);
  const closingRateTarget = 82.0; // Target: 82%
  const closingRateStatus = closingRateVal >= closingRateTarget ? 'pass' : (closingRateVal >= 65.0 ? 'warning' : 'fail');

  // 10. Frequency
  const freqVal = rawFrequency;
  const freqTarget = 3.0; // Target: < 3.0
  const freqStatus = freqVal < freqTarget ? 'pass' : (freqVal < 3.5 ? 'warning' : 'fail');

  // Additional Financials
  const grossProfit = revenue - (purchases * cogs);
  const netProfit = revenue - (purchases * cogs) - spend;
  const roas = spend > 0 ? revenue / spend : 0;
  const realRoi = spend > 0 ? (netProfit / spend) * 100 : 0;

  const kpis = [
    {
      id: 1,
      name: 'CTR',
      description: 'Click-Through Rate',
      actualFormatted: formatPercent(ctrVal, 2),
      targetFormatted: `> ${formatPercent(ctrTarget, 0)}`,
      actualRaw: ctrVal,
      targetRaw: ctrTarget,
      status: ctrStatus,
    },
    {
      id: 2,
      name: 'CPC',
      description: 'Cost Per Click',
      actualFormatted: formatIDR(cpcVal),
      targetFormatted: `≤ ${formatIDR(cpcTarget)} (1%)`,
      actualRaw: cpcVal,
      targetRaw: cpcTarget,
      status: cpcStatus,
    },
    {
      id: 3,
      name: 'LC to LPV',
      description: 'Link Click to Landing Page View',
      actualFormatted: formatPercent(lcToLpvVal, 1),
      targetFormatted: `≥ ${formatPercent(lcToLpvTarget, 0)}`,
      actualRaw: lcToLpvVal,
      targetRaw: lcToLpvTarget,
      status: lcToLpvStatus,
    },
    {
      id: 4,
      name: 'Cost LPV',
      description: 'Cost per Landing Page View',
      actualFormatted: formatIDR(costLpvVal),
      targetFormatted: `${formatIDR(costLpvTargetMin)}-${formatIDR(costLpvTargetMax)} (2-3%)`,
      actualRaw: costLpvVal,
      targetRaw: costLpvTargetMax,
      status: costLpvStatus,
    },
    {
      id: 5,
      name: 'CPM',
      description: 'Cost Per Mille (1,000 Imp)',
      actualFormatted: formatIDR(cpmVal),
      targetFormatted: `≤ ${formatIDR(cpmTarget)}`,
      actualRaw: cpmVal,
      targetRaw: cpmTarget,
      status: cpmStatus,
    },
    {
      id: 6,
      name: 'LPV to ATC',
      description: 'Landing Page to Add-To-Cart',
      actualFormatted: formatPercent(lpvToAtcVal, 1),
      targetFormatted: `≥ ${formatPercent(lpvToAtcTarget, 0)}`,
      actualRaw: lpvToAtcVal,
      targetRaw: lpvToAtcTarget,
      status: lpvToAtcStatus,
    },
    {
      id: 7,
      name: 'ATC to IC',
      description: 'Add-To-Cart to Initiate Checkout',
      actualFormatted: formatPercent(atcToIcVal, 1),
      targetFormatted: `≥ ${formatPercent(atcToIcTarget, 0)}`,
      actualRaw: atcToIcVal,
      targetRaw: atcToIcTarget,
      status: atcToIcStatus,
    },
    {
      id: 8,
      name: 'CPR',
      description: 'Cost Per Result (Purchase)',
      actualFormatted: purchases > 0 ? formatIDR(cprVal) : (spend >= cprTarget ? `Bleed (${formatIDR(spend)})` : 'No purchase'),
      targetFormatted: `≤ ${formatIDR(cprTarget)} (25%)`,
      actualRaw: cprVal,
      targetRaw: cprTarget,
      status: cprStatus,
    },
    {
      id: 9,
      name: 'Closing Rate',
      description: 'Purchase Conversion from IC',
      actualFormatted: formatPercent(closingRateVal, 1),
      targetFormatted: `≥ ${formatPercent(closingRateTarget, 0)}`,
      actualRaw: closingRateVal,
      targetRaw: closingRateTarget,
      status: closingRateStatus,
    },
    {
      id: 10,
      name: 'Frequency',
      description: 'Ad Frequency Exposure',
      actualFormatted: `${freqVal.toFixed(2)}x`,
      targetFormatted: `< ${freqTarget.toFixed(1)}x`,
      actualRaw: freqVal,
      targetRaw: freqTarget,
      status: freqStatus,
    },
  ];

  return {
    kpis,
    summary: {
      spend,
      impressions,
      clicks,
      lpv,
      atc,
      ic,
      purchases,
      revenue,
      grossProfit,
      netProfit,
      roas,
      realRoi,
      reach,
      frequency: freqVal,
      basePrice,
      cogs,
      cprVal,
      cprTarget,
      ctrVal,
      ctrTarget,
      cpmVal
    }
  };
}

/**
 * Auto-Move Rule Evaluation
 * If CTR > 2% and CPR actual <= Target consistently -> promote to next lifecycle stage
 */
export function evaluateAutoMove(summary, currentStatus) {
  const isWinningCTR = summary.ctrVal >= 2.0;
  const isWinningCPR = summary.purchases > 0 && summary.cprVal <= summary.cprTarget;

  if (isWinningCTR && isWinningCPR) {
    if (currentStatus === 'test') {
      return {
        eligible: true,
        nextStage: 'scale1',
        nextStageLabel: 'SCALE 1 (Winning Ad Set & LLA Audiens)',
        badgeText: 'Auto-Move Ready: Scale 1',
        reason: `CTR ${formatPercent(summary.ctrVal)} (>2%) & CPR ${formatIDR(summary.cprVal)} (≤${formatIDR(summary.cprTarget)}) lolos syarat Scale 1.`
      };
    } else if (currentStatus === 'scale1') {
      return {
        eligible: true,
        nextStage: 'scale2',
        nextStageLabel: 'SCALE 2 (Final Scale & Full Budget Injection)',
        badgeText: 'Auto-Move Ready: Scale 2',
        reason: `Performa Scale 1 stabil dengan ROAS ${summary.roas.toFixed(2)}x dan CPR ${formatIDR(summary.cprVal)}. Siap full budget injection.`
      };
    }
  }

  return {
    eligible: false,
    nextStage: currentStatus,
    badgeText: null,
    reason: null
  };
}

/**
 * Kill Recommendation Rule Evaluation
 * Pink/Rose badge if CPR substantially exceeds threshold or CPM stays persistently bad.
 */
export function evaluateKillRecommendation(summary) {
  const reasons = [];

  // 1. CPR exceeds target significantly (> 1.35x target CPR or 0 purchase with high spend)
  if (summary.purchases > 0 && summary.cprVal > summary.cprTarget * 1.35) {
    reasons.push(`CPR ${formatIDR(summary.cprVal)} melebihi 135% batas target (${formatIDR(summary.cprTarget)}).`);
  } else if (summary.purchases === 0 && summary.spend >= summary.cprTarget * 1.2) {
    reasons.push(`Spend ${formatIDR(summary.spend)} sudah melampaui target CPR tanpa adanya penjualan (0 Purchases).`);
  }

  // 2. CPM persistently bad (> Rp 45.000)
  if (summary.impressions > 1000 && summary.cpmVal > 45000) {
    reasons.push(`CPM Rp ${Math.round(summary.cpmVal).toLocaleString('id-ID')} sangat mahal (Target Rp 32.000). Audiens jenuh/iklan tidak relevan.`);
  }

  // 3. CTR deeply sub-par (< 1.0% with significant impressions)
  if (summary.impressions > 3000 && summary.ctrVal < 1.0) {
    reasons.push(`CTR ${formatPercent(summary.ctrVal)} sangat rendah (< 1.0%). Kreatif gagal menghentikan scroll.`);
  }

  const shouldKill = reasons.length > 0;

  return {
    shouldKill,
    severity: reasons.length >= 2 ? 'high' : (shouldKill ? 'medium' : 'none'),
    reasons,
    badgeLabel: shouldKill ? 'REKOMENDASI: KILL / PAUSE' : null
  };
}

/**
 * Calculate Creative Leaderboard Score
 * Composite formula crossing highest CTR with lowest CPR
 * Score = (CTR / 2.0) * 50 + (TargetCPR / (ActualCPR || TargetCPR)) * 50
 */
export function calculateCreativeScore(asset, targetCpr = 37250) {
  const ctr = asset.total_impressions > 0 ? (asset.total_clicks / asset.total_impressions) * 100 : 0;
  const cpr = asset.total_purchases > 0 ? (asset.total_spend / asset.total_purchases) : (asset.total_spend || 1);

  // Normalize: higher CTR increases score, lower CPR increases score
  const ctrComponent = Math.min(ctr / 2.0, 3.0) * 50; // 50 pts at 2.0% CTR
  const cprRatio = targetCpr / Math.max(cpr, 1000);
  const cprComponent = Math.min(cprRatio, 3.0) * 50;

  const compositeScore = Math.round(ctrComponent + cprComponent);
  return {
    score: compositeScore,
    ctr,
    cpr,
  };
}

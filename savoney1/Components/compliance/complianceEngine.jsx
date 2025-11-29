// Real-Time Compliance Engine - RBI Advisory Pattern Checks
// This module analyzes transactions against regulatory patterns

export const RBI_THRESHOLDS = {
  CASH_TRANSACTION_LIMIT: 200000,      // ₹2L cash transaction reporting
  HIGH_VALUE_TRANSACTION: 1000000,     // ₹10L high-value alert
  SUSPICIOUS_TRANSFER_LIMIT: 500000,   // ₹5L suspicious transfer threshold
  DAILY_AGGREGATE_LIMIT: 1000000,      // ₹10L daily aggregate
  STRUCTURING_THRESHOLD: 190000,       // Just below reporting limit
  RAPID_TRANSACTION_COUNT: 5,          // Multiple transactions in short time
};

export const RISK_WEIGHTS = {
  offshore_transfer: 40,
  crypto_related: 35,
  cash_intensive: 25,
  unknown_counterparty: 30,
  high_value: 20,
  structuring_pattern: 45,
  velocity_anomaly: 30,
};

// Analyze single transaction for compliance
export const analyzeTransaction = (transaction, historicalData = []) => {
  const findings = [];
  let riskScore = 0;

  // Check 1: High-value cash transaction (RBI mandate)
  if (transaction.amount >= RBI_THRESHOLDS.CASH_TRANSACTION_LIMIT && 
      (transaction.type === 'withdrawal' || transaction.category === 'Cash')) {
    findings.push({
      rule: 'RBI_CASH_LIMIT',
      severity: 'high',
      message: `Cash transaction of ₹${transaction.amount.toLocaleString('en-IN')} exceeds ₹2L reporting threshold`
    });
    riskScore += RISK_WEIGHTS.cash_intensive;
  }

  // Check 2: Offshore/International transfers
  const offshoreKeywords = ['offshore', 'international', 'foreign', 'overseas', 'forex'];
  if (offshoreKeywords.some(kw => 
    transaction.counterparty?.toLowerCase().includes(kw) ||
    transaction.category?.toLowerCase().includes(kw)
  )) {
    findings.push({
      rule: 'OFFSHORE_TRANSFER',
      severity: 'medium',
      message: 'International transfer detected - requires FEMA compliance check'
    });
    riskScore += RISK_WEIGHTS.offshore_transfer;
  }

  // Check 3: Crypto-related transactions
  const cryptoKeywords = ['crypto', 'bitcoin', 'ethereum', 'binance', 'coinbase', 'wazirx'];
  if (cryptoKeywords.some(kw => 
    transaction.counterparty?.toLowerCase().includes(kw) ||
    transaction.category?.toLowerCase().includes(kw)
  )) {
    findings.push({
      rule: 'CRYPTO_TRANSACTION',
      severity: 'medium',
      message: 'Cryptocurrency transaction - RBI advisory compliance required'
    });
    riskScore += RISK_WEIGHTS.crypto_related;
  }

  // Check 4: Unknown counterparty
  const unknownKeywords = ['unknown', 'anonymous', 'unverified'];
  if (unknownKeywords.some(kw => 
    transaction.counterparty?.toLowerCase().includes(kw)
  )) {
    findings.push({
      rule: 'UNKNOWN_COUNTERPARTY',
      severity: 'high',
      message: 'Transaction with unverified/unknown party - KYC verification required'
    });
    riskScore += RISK_WEIGHTS.unknown_counterparty;
  }

  // Check 5: High-value transaction
  if (transaction.amount >= RBI_THRESHOLDS.HIGH_VALUE_TRANSACTION) {
    findings.push({
      rule: 'HIGH_VALUE_ALERT',
      severity: 'medium',
      message: `High-value transaction of ₹${transaction.amount.toLocaleString('en-IN')} flagged for review`
    });
    riskScore += RISK_WEIGHTS.high_value;
  }

  // Check 6: Structuring detection (amounts just below threshold)
  if (transaction.amount >= RBI_THRESHOLDS.STRUCTURING_THRESHOLD && 
      transaction.amount < RBI_THRESHOLDS.CASH_TRANSACTION_LIMIT) {
    const recentSimilar = historicalData.filter(t => 
      t.amount >= RBI_THRESHOLDS.STRUCTURING_THRESHOLD &&
      t.amount < RBI_THRESHOLDS.CASH_TRANSACTION_LIMIT
    );
    if (recentSimilar.length >= 2) {
      findings.push({
        rule: 'STRUCTURING_SUSPECTED',
        severity: 'high',
        message: 'Potential structuring detected - multiple transactions just below reporting threshold'
      });
      riskScore += RISK_WEIGHTS.structuring_pattern;
    }
  }

  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  return {
    transactionId: transaction.transaction_id || transaction.id,
    riskLevel,
    riskScore: Math.min(100, riskScore),
    findings,
    requiresReview: riskLevel !== 'low',
    timestamp: new Date().toISOString()
  };
};

// Batch analyze all transactions
export const analyzeAllTransactions = (transactions) => {
  return transactions.map(txn => analyzeTransaction(txn, transactions));
};

// Calculate user risk level based on transaction history
export const calculateUserRiskLevel = (transactions, profile) => {
  if (!transactions || transactions.length === 0) {
    return { level: 'low', score: 0, factors: [] };
  }

  const analyses = analyzeAllTransactions(transactions);
  const avgRiskScore = analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length;
  const highRiskCount = analyses.filter(a => a.riskLevel === 'high').length;
  const factors = [];

  if (highRiskCount > 0) {
    factors.push(`${highRiskCount} high-risk transactions detected`);
  }

  if (profile?.kyc_status !== 'verified') {
    factors.push('KYC verification incomplete');
  }

  let level = 'low';
  let score = Math.round(avgRiskScore);
  
  if (highRiskCount >= 3 || avgRiskScore >= 50) {
    level = 'high';
    score = Math.min(100, score + 20);
  } else if (highRiskCount >= 1 || avgRiskScore >= 25) {
    level = 'medium';
  }

  return { level, score, factors, highRiskCount };
};
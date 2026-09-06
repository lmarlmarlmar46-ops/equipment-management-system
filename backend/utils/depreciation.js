/**
 * Asset Depreciation Calculation Utilities
 * Supports multiple depreciation methods
 */

// Straight-Line Depreciation
const straightLineDepreciation = (purchasePrice, salvageValue, usefulLifeYears, yearsElapsed) => {
  const annualDepreciation = (purchasePrice - salvageValue) / usefulLifeYears;
  const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, purchasePrice - salvageValue);
  const currentValue = purchasePrice - totalDepreciation;
  
  return {
    method: 'Straight-Line',
    purchasePrice,
    salvageValue,
    usefulLifeYears,
    yearsElapsed,
    annualDepreciation: parseFloat(annualDepreciation.toFixed(2)),
    totalDepreciation: parseFloat(totalDepreciation.toFixed(2)),
    currentValue: parseFloat(Math.max(currentValue, salvageValue).toFixed(2)),
    depreciationRate: parseFloat(((totalDepreciation / purchasePrice) * 100).toFixed(2))
  };
};

// Declining Balance Depreciation (Double Declining Balance)
const decliningBalanceDepreciation = (purchasePrice, salvageValue, usefulLifeYears, yearsElapsed, rate = 2) => {
  const depreciationRate = rate / usefulLifeYears;
  let currentValue = purchasePrice;
  let totalDepreciation = 0;
  
  for (let year = 1; year <= Math.floor(yearsElapsed); year++) {
    const yearlyDepreciation = currentValue * depreciationRate;
    const newValue = currentValue - yearlyDepreciation;
    
    // Don't depreciate below salvage value
    if (newValue < salvageValue) {
      totalDepreciation += currentValue - salvageValue;
      currentValue = salvageValue;
      break;
    }
    
    totalDepreciation += yearlyDepreciation;
    currentValue = newValue;
  }
  
  // Handle partial year
  const partialYear = yearsElapsed - Math.floor(yearsElapsed);
  if (partialYear > 0 && currentValue > salvageValue) {
    const partialDepreciation = currentValue * depreciationRate * partialYear;
    if (currentValue - partialDepreciation >= salvageValue) {
      totalDepreciation += partialDepreciation;
      currentValue -= partialDepreciation;
    }
  }
  
  return {
    method: 'Declining Balance (DDB)',
    purchasePrice,
    salvageValue,
    usefulLifeYears,
    yearsElapsed,
    rate,
    totalDepreciation: parseFloat(totalDepreciation.toFixed(2)),
    currentValue: parseFloat(Math.max(currentValue, salvageValue).toFixed(2)),
    depreciationRate: parseFloat(((totalDepreciation / purchasePrice) * 100).toFixed(2))
  };
};

// Sum of Years Digits Depreciation
const sumOfYearsDigitsDepreciation = (purchasePrice, salvageValue, usefulLifeYears, yearsElapsed) => {
  const depreciableAmount = purchasePrice - salvageValue;
  const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
  
  let totalDepreciation = 0;
  const yearsCompleted = Math.floor(yearsElapsed);
  
  for (let year = 1; year <= yearsCompleted; year++) {
    const remainingLife = usefulLifeYears - year + 1;
    const yearlyDepreciation = (remainingLife / sumOfYears) * depreciableAmount;
    totalDepreciation += yearlyDepreciation;
  }
  
  // Handle partial year
  const partialYear = yearsElapsed - yearsCompleted;
  if (partialYear > 0 && yearsCompleted < usefulLifeYears) {
    const remainingLife = usefulLifeYears - yearsCompleted;
    const partialDepreciation = (remainingLife / sumOfYears) * depreciableAmount * partialYear;
    totalDepreciation += partialDepreciation;
  }
  
  totalDepreciation = Math.min(totalDepreciation, depreciableAmount);
  const currentValue = purchasePrice - totalDepreciation;
  
  return {
    method: 'Sum of Years Digits',
    purchasePrice,
    salvageValue,
    usefulLifeYears,
    yearsElapsed,
    sumOfYears,
    totalDepreciation: parseFloat(totalDepreciation.toFixed(2)),
    currentValue: parseFloat(Math.max(currentValue, salvageValue).toFixed(2)),
    depreciationRate: parseFloat(((totalDepreciation / purchasePrice) * 100).toFixed(2))
  };
};

// Calculate years elapsed from purchase date
const calculateYearsElapsed = (purchaseDate) => {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now - purchase);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return parseFloat((diffDays / 365.25).toFixed(2));
};

// Main depreciation calculator - auto-selects method
const calculateDepreciation = (purchasePrice, salvageValue, usefulLifeYears, purchaseDate, method = 'straight-line') => {
  const yearsElapsed = calculateYearsElapsed(purchaseDate);
  
  // Set default salvage value to 10% if not provided
  const finalSalvageValue = salvageValue || purchasePrice * 0.1;
  
  switch (method.toLowerCase()) {
    case 'declining-balance':
    case 'ddb':
      return decliningBalanceDepreciation(purchasePrice, finalSalvageValue, usefulLifeYears, yearsElapsed);
    
    case 'sum-of-years':
    case 'syd':
      return sumOfYearsDigitsDepreciation(purchasePrice, finalSalvageValue, usefulLifeYears, yearsElapsed);
    
    case 'straight-line':
    case 'sl':
    default:
      return straightLineDepreciation(purchasePrice, finalSalvageValue, usefulLifeYears, yearsElapsed);
  }
};

// Depreciation schedule generator
const generateDepreciationSchedule = (purchasePrice, salvageValue, usefulLifeYears, purchaseDate, method = 'straight-line') => {
  const schedule = [];
  const finalSalvageValue = salvageValue || purchasePrice * 0.1;
  
  for (let year = 0; year <= usefulLifeYears; year++) {
    const depreciation = calculateDepreciation(purchasePrice, finalSalvageValue, usefulLifeYears, purchaseDate, method);
    
    // Adjust for specific year
    let yearValue;
    if (method.toLowerCase() === 'straight-line' || method === 'sl') {
      const annualDep = (purchasePrice - finalSalvageValue) / usefulLifeYears;
      const totalDep = Math.min(annualDep * year, purchasePrice - finalSalvageValue);
      yearValue = purchasePrice - totalDep;
    } else {
      // Recalculate for specific year
      const tempCalc = calculateDepreciation(purchasePrice, finalSalvageValue, usefulLifeYears, purchaseDate, method);
      yearValue = tempCalc.currentValue;
    }
    
    schedule.push({
      year,
      beginningValue: year === 0 ? purchasePrice : schedule[year - 1].endingValue,
      depreciation: year === 0 ? 0 : schedule[year - 1].endingValue - yearValue,
      endingValue: parseFloat(Math.max(yearValue, finalSalvageValue).toFixed(2))
    });
  }
  
  return schedule;
};

module.exports = {
  straightLineDepreciation,
  decliningBalanceDepreciation,
  sumOfYearsDigitsDepreciation,
  calculateDepreciation,
  calculateYearsElapsed,
  generateDepreciationSchedule
};

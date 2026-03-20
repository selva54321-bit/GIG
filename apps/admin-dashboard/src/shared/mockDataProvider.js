/**
 * Mock Data for Frontend Charts
 */

export const getNAVData = () => [
    { month: 'Jan', nav: 100.0, claims: 20.0 },
    { month: 'Feb', nav: 105.2, claims: 15.0 },
    { month: 'Mar', nav: 112.5, claims: 45.0 }, // High claim month
    { month: 'Apr', nav: 118.0, claims: 10.0 },
    { month: 'May', nav: 125.4, claims: 12.0 },
    { month: 'Jun', nav: 132.1, claims: 18.0 },
  ];
  
  export const getTierDistribution = () => [
    { tier: 'Platinum', count: 120, color: '#B4B4B4' },
    { tier: 'Gold', count: 450, color: '#FFD700' },
    { tier: 'Silver', count: 890, color: '#C0C0C0' },
    { tier: 'Bronze', count: 320, color: '#CD7F32' },
  ];
  
  export const getCorpusGrowthProjection = (contribution) => {
    const data = [];
    let current = contribution;
    for (let i = 1; i <= 12; i++) {
        current *= 1.006; // ~7.2% p.a. monthly compounding
        data.push({ month: `M${i}`, value: parseFloat(current.toFixed(2)) });
    }
    return data;
  };

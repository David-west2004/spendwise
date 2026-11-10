/**
 * Computes safe daily spend for remaining days in current billing cycle
 * @param {number} totalIncome - Sum of all income recorded this month
 * @param {number} totalExpenses - Sum of all expenses recorded this month
 * @param {number} fixedBills - Upcoming reserved commitments (e.g. data subscription, rent)
 * @param {Date} [currentDate=new Date()]
 * @returns {object} Health status and daily allowance limit
 */
function calculateSafeSpend(
  totalIncome,
  totalExpenses,
  fixedBills = 0,
  currentDate = new Date()
) {
  const currentBalance = totalIncome - totalExpenses;
  const discretionaryPool = currentBalance - fixedBills;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemaining = Math.max(totalDaysInMonth - currentDay + 1, 1);

  const dailySafeSpend =
    discretionaryPool > 0
      ? Number((discretionaryPool / daysRemaining).toFixed(2))
      : 0;

  let healthStatus = 'ON_TRACK'; // 'ON_TRACK' (green), 'CAUTION' (amber), 'DEFICIT' (red)
  if (currentBalance <= 0 || discretionaryPool <= 0) {
    healthStatus = 'DEFICIT';
  } else if (dailySafeSpend < 1000) {
    // Baseline threshold (e.g. 1000 NGN)
    healthStatus = 'CAUTION';
  }

  return {
    currentBalance,
    discretionaryPool,
    daysRemaining,
    dailySafeSpend,
    healthStatus,
  };
}

module.exports = {
  calculateSafeSpend,
};

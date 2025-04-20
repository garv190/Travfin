import { expect } from 'chai';
import { calculateBalances } from '../index.js';

describe('Unit Tests for Utility Functions', () => {
  describe('calculateBalances', () => {
    it('should calculate balances correctly for valid transactions', () => {
      const transactions = [
        {
          payer: { _id: 'user1' },
          shares: [
            { user: { _id: 'user1' }, amount: 50 },
            { user: { _id: 'user2' }, amount: 50 },
          ],
        },
      ];
      const currentUserId = 'user1';

      const result = calculateBalances(transactions, currentUserId);

      expect(result.totalOwned).to.equal(50);
      expect(result.totalOwed).to.equal(0);
      expect(result.netResult).to.equal(50);
    });

    it('should handle empty transactions gracefully', () => {
      const result = calculateBalances([], 'user1');
      expect(result.totalOwned).to.equal(0);
      expect(result.totalOwed).to.equal(0);
      expect(result.netResult).to.equal(0);
    });
  });
});
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance: Balance = { income: 0, outcome: 0, total: 0 };
    const result = await this.find()

    result.forEach(transaction => {
      balance[transaction.type] += transaction.value;
      if (transaction.type === 'income') {
        balance.total += transaction.value;
      } else if (transaction.type === 'outcome') {
        balance.total -= transaction.value;
      }
    });
    return balance;
  }
}

export default TransactionsRepository;

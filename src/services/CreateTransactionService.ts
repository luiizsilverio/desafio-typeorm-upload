import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
  
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Tipo de transação inválida (income | outcome)');
    }

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (balance.total < value) {
        throw new AppError('Saldo insuficiente para essa transação');
      }
    }
   
    if (!category) {
      throw new AppError('Categoria não informada', 400);
    }

    const categoryRepository = getRepository(Category);
    let categoryExists = await categoryRepository.findOne({
      where: { title: category }
    });

    let category_id = categoryExists ? categoryExists.id : null;
    
    if (!categoryExists) {
      categoryExists = await categoryRepository.save({ title: category });
      category_id = categoryExists ? categoryExists.id : null;
    }

    const transaction = transactionsRepository.create({
      title, //<---- dá erro nessa linha
      value,
      type,
      category: category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

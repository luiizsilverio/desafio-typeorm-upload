import { getCustomRepository } from 'typeorm';
import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';
//import AppError from '../errors/AppError';
import uploadConfig from '../config/upload';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  public async execute(filename: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createTransaction = new CreateTransactionService();
    
    const csvFilePath = path.join(uploadConfig.directory, filename);    
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({ 
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    let lines: Request[] = [];
    let transactions: Transaction[] = [];
    let transaction: Transaction;

    parseCSV.on('data', line => {
      const title = line[0];
      const type = line[1] as 'income' | 'outcome';
      const value = parseFloat(line[2]);
      const category = line[3];
      lines.push({ title, value, type, category });
    });
    
    return new Promise<Transaction[]>(resolve => {
      parseCSV.on('end', async () => {
        for await (let request of lines) {
          transaction = await createTransaction.execute(request);
          transactions.push(transaction);
        }   
        resolve(transactions);       
      });
    });
    
  }
}

export default ImportTransactionsService;

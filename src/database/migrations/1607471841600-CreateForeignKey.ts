import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export default class CreateForeignKey1607471841600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            'transactions',
            new TableForeignKey({
                name: 'fkTransactionCategory',
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                //onDelete: 'RESTRICTED', //não deixa deletar coluna relacionada
                //onDelete: 'CASCADE', //se deletar, deleta todos os relacionados
                onDelete: 'SET NULL', //se deletar, grava null na coluna
                onUpdate: 'CASCADE',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('transactions', 'fkTransactionCategory');
    }

}

import { DataTypes } from 'sequelize';

export default function TransactionModel(sequelize) {
  const Transaction = sequelize.define(
    'Transaction',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false }, // recharge, purchase, refund
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      balanceBefore: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      balanceAfter: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'completed' }, // pending, completed, failed
      description: { type: DataTypes.TEXT },
      referenceId: { type: DataTypes.STRING },
      metadata: { type: DataTypes.JSONB },
    },
    {
      tableName: 'transactions',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: [{ name: 'created_at', order: 'DESC' }] },
      ],
    }
  );

  return Transaction;
}

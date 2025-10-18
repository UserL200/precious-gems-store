import { DataTypes } from 'sequelize';

export default function TapPayModel(sequelize) {
  const TapPayTransaction = sequelize.define(
    'TapPayTransaction',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      cardId: { type: DataTypes.UUID, allowNull: false },
      transactionId: { type: DataTypes.UUID },
      readerId: { type: DataTypes.STRING },
      busNumber: { type: DataTypes.STRING },
      routeId: { type: DataTypes.UUID },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      nonce: { type: DataTypes.STRING, allowNull: false, unique: true },
      signature: { type: DataTypes.STRING, allowNull: false },
      locationLat: { type: DataTypes.DECIMAL(10, 8) },
      locationLon: { type: DataTypes.DECIMAL(11, 8) },
      status: { type: DataTypes.STRING, defaultValue: 'completed' },
    },
    {
      tableName: 'tap_pay_transactions',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['nonce'] },
        { fields: [{ name: 'created_at', order: 'DESC' }] },
      ],
    }
  );

  return TapPayTransaction;
}

import { DataTypes } from 'sequelize';

export default function VirtualCardModel(sequelize) {
  const VirtualCard = sequelize.define(
    'VirtualCard',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      cardNumber: { type: DataTypes.STRING(16), allowNull: false, unique: true },
      encryptedData: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'inactive' },
      isNfcEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      activatedAt: { type: DataTypes.DATE },
      expiresAt: { type: DataTypes.DATE },
      lastUsedAt: { type: DataTypes.DATE },
      useCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: 'virtual_cards',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
      ],
    }
  );

  return VirtualCard;
}

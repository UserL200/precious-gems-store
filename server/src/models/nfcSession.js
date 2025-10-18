import { DataTypes } from 'sequelize';

export default function NfcSessionModel(sequelize) {
  const NfcSession = sequelize.define(
    'NfcSession',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      cardId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      sessionKey: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'active' },
      startedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      endedAt: { type: DataTypes.DATE },
      transactionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'nfc_sessions', underscored: true, indexes: [{ fields: ['card_id'] }, { fields: ['status'] }] }
  );

  return NfcSession;
}

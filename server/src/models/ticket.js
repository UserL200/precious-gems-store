import { DataTypes } from 'sequelize';

export default function TicketModel(sequelize) {
  const Ticket = sequelize.define(
    'Ticket',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      routeId: { type: DataTypes.UUID },
      busNumber: { type: DataTypes.STRING, allowNull: false },
      fromLocation: { type: DataTypes.STRING, allowNull: false },
      toLocation: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      qrCode: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'active' },
      validFrom: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      validUntil: { type: DataTypes.DATE, allowNull: false },
      usedAt: { type: DataTypes.DATE },
    },
    {
      tableName: 'tickets',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['valid_from', 'valid_until'] },
      ],
    }
  );

  return Ticket;
}

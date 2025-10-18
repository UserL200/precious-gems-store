import { DataTypes } from 'sequelize';

export default function BusStopModel(sequelize) {
  const BusStop = sequelize.define(
    'BusStop',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      routeId: { type: DataTypes.UUID, allowNull: false },
      stopOrder: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      arrivalTime: { type: DataTypes.TIME, allowNull: false },
      platform: { type: DataTypes.STRING },
      latitude: { type: DataTypes.DECIMAL(10, 8) },
      longitude: { type: DataTypes.DECIMAL(11, 8) },
      isTransferPoint: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'bus_stops',
      underscored: true,
      indexes: [
        { fields: ['route_id'] },
        { fields: ['route_id', 'stop_order'] },
      ],
    }
  );

  return BusStop;
}

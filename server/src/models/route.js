import { DataTypes } from 'sequelize';

export default function RouteModel(sequelize) {
  const Route = sequelize.define(
    'Route',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      busNumber: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      fromLocation: { type: DataTypes.STRING, allowNull: false },
      toLocation: { type: DataTypes.STRING, allowNull: false },
      departureTime: { type: DataTypes.TIME, allowNull: false },
      arrivalTime: { type: DataTypes.TIME, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      distance: { type: DataTypes.DECIMAL(10, 2) },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      transfers: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      daysOfWeek: { type: DataTypes.STRING, defaultValue: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
    },
    { tableName: 'routes', underscored: true, indexes: [{ fields: ['from_location', 'to_location'] }, { fields: ['is_active'] }] }
  );

  return Route;
}

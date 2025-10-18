import { DataTypes } from 'sequelize';

export default function SearchHistoryModel(sequelize) {
  const SearchHistory = sequelize.define(
    'SearchHistory',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      fromLocation: { type: DataTypes.STRING, allowNull: false },
      toLocation: { type: DataTypes.STRING, allowNull: false },
      searchTime: { type: DataTypes.TIME },
    },
    {
      tableName: 'search_history',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: [{ name: 'created_at', order: 'DESC' }] },
      ],
    }
  );

  return SearchHistory;
}

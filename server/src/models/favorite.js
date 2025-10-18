import { DataTypes } from 'sequelize';

export default function FavoriteModel(sequelize) {
  const Favorite = sequelize.define(
    'Favorite',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      fromLocation: { type: DataTypes.STRING, allowNull: false },
      toLocation: { type: DataTypes.STRING, allowNull: false },
      nickname: { type: DataTypes.STRING },
    },
    {
      tableName: 'favorites',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { unique: true, fields: ['user_id', 'from_location', 'to_location'] },
      ],
    }
  );

  return Favorite;
}

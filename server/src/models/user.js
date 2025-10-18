import { DataTypes } from 'sequelize';

export default function UserModel(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING },
      balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 50.0 },
      cardNumber: { type: DataTypes.STRING },
      avatarUrl: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      lastLogin: { type: DataTypes.DATE },
      nfcEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      dailyLimit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 500.0 },
      dailySpent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
      lastResetDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'users',
      underscored: true,
      indexes: [{ fields: ['email'] }],
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: { withPassword: { attributes: {} } },
    }
  );

  return User;
}

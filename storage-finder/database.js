const { Sequelize, DataTypes } = require('sequelize');

// PostgreSQL Connection
const sequelize = new Sequelize('lost_and_found', 'postgres', 'Jatin1101', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    port: 5432  // Default PostgreSQL port
});

// User Model
const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    phone: DataTypes.STRING,
    role: {
        type: DataTypes.ENUM('student', 'admin'),
        allowNull: false
    }
}, {
    tableName: 'users',  // Explicit table name
    timestamps: false    // Disable Sequelize's timestamp columns
});

// Item Model
const Item = sequelize.define('Item', {
    item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    found_date: DataTypes.DATE,
    status: {
        type: DataTypes.ENUM('Unclaimed', 'Claimed', 'Processed'),
        defaultValue: 'Unclaimed'
    },
    image_url: DataTypes.STRING
}, {
    tableName: 'items',
    timestamps: false
});

// FoundItem Model
const FoundItem = sequelize.define('FoundItem', {
    record_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    found_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: DataTypes.STRING
}, {
    tableName: 'found_items',
    timestamps: false
});

// Associations
User.hasMany(FoundItem, { foreignKey: 'found_by_user_id' });
Item.hasOne(FoundItem, { foreignKey: 'item_id' });
FoundItem.belongsTo(User, { foreignKey: 'found_by_user_id' });
FoundItem.belongsTo(Item, { foreignKey: 'item_id' });

// Initialize Database
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connection established.');
        
        // Sync models (create tables if not exist)
        await sequelize.sync({ alter: true });
        
        // Check if admin exists
        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@example.com' },
            defaults: {
                name: 'Admin',
                email: 'admin@example.com',
                role: 'admin'
            }
        });

        if (created) {
            console.log('Admin user created');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Export models and initialization
module.exports = {
    sequelize,
    User,
    Item,
    FoundItem,
    initializeDatabase
};
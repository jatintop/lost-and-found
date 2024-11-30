const express = require('express');
const { 
    User, 
    Item, 
    FoundItem, 
    initializeDatabase 
} = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Database
initializeDatabase();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/found-items', async (req, res) => {
    try {
        console.log('Received request for found items');
        const items = await Item.findAll({
            include: [
                { 
                    model: FoundItem,
                    attributes: ['location'], 
                    include: [
                        { 
                            model: User, 
                            attributes: ['name'] 
                        }
                    ]
                }
            ]
        });
        console.log('Items found:', JSON.stringify(items, null, 2));
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message 
        });
    }
});

app.post('/api/add-item', async (req, res) => {
    const { itemName, description, category, location, foundDate, imageUrl } = req.body;
    
    try {
        // Find admin user
        const admin = await User.findOne({ 
            where: { email: 'admin@example.com' } 
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        // Create Item
        const item = await Item.create({
            item_name: itemName,
            description,
            category,
            found_date: foundDate,
            image_url: imageUrl,
            status: 'unclaimed'
        });

        // Create Found Item
        await FoundItem.create({
            found_date: foundDate,
            location,
            item_id: item.item_id,
            found_by_user_id: admin.user_id
        });

        res.status(201).json({ 
            message: 'Item added successfully', 
            item 
        });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
import express from 'express';
import Joi from 'joi';
import DataGenrator , { UserRow } from '../Data/genarator';
import { error } from 'console';

const router = express.Router();
const dataGen = DataGenrator.getInstance();

const seedSchema = Joi.object({
    users: Joi.number().integer().min(1).max(100000).default(50000),
    orders: Joi.number().integer().min(1).max(1000000).default(500000),
    products: Joi.number().integer().min(1).max(50000).default(10000),
});

const usersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(200).default(50),
    search: Joi.string().allow('').default(''),
    sortBy: Joi.string().valid('name','email','createdAt','orderTotal').default('name'),
    sortDir: Joi.string().valid('asc','desc').default('asc'),
});

const userOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(200).default(50),
});

router.post('/seed',async (req , res) => {
    try {
        const { error, value } = seedSchema.validate(req.query);
        if(error) {
            return res.status(400).json({error: error.details[0].message});
        }

        const { users, orders, products } = value;
        const startTime = Date.now();

        const result = dataGen.generateData(users, orders, products);

        const duration = Date.now() - startTime;
        console.log(`Data genaration completed in ${duration} ms`)

        res.json({
            ...result,
            message : 'Database seed succussfully',
            duration:  `${duration} ms`,
        });
    } catch (error) {
        console.error('seed error:', error);
        res.status(500).json({error: 'Failed seed error'});
    }
});

router.get('/users', async (req, res) => {
  try {
    const { error, value } = usersQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { page, pageSize, search, sortBy, sortDir } = value;
    const startTime = Date.now();

    let users = dataGen.getUserRows();

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    users.sort((a: UserRow, b: UserRow) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'orderTotal':
          aVal = a.orderTotal;
          bVal = b.orderTotal;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          aVal = a[sortBy as keyof UserRow];
          bVal = b[sortBy as keyof UserRow];
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (sortDir === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    // Pagination
    const total = users.length;
    const start = (page - 1) * pageSize;
    const paginatedUsers = users.slice(start, start + pageSize);

    const duration = Date.now() - startTime;
    
    // Log performance for monitoring
    if (duration > 300) {
      console.warn(`⚠️  Slow query: GET /api/users took ${duration}ms (page=${page}, search="${search}")`);
    }

    res.json({
      items: paginatedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page < Math.ceil(total / pageSize),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error('Users query error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id/orders', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId) || userId < 1) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    const {error , value} = userOrdersQuerySchema.validate(req.query);
    if (error) {
        return res.status(400).json({ error: error.details[0].message})
    }

    const { page, pageSize } = value;
    const users = dataGen.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allOrders = dataGen.getUserOrders(userId);

    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = allOrders.length;
    const start = (page - 1) * pageSize;
    const orders = allOrders.slice(start, start + pageSize);

    res.json({
        items : orders,
        total,
        page,
        pageSize,
        totalPages : Math.ceil(total / pageSize),
        hasNextPage : page < Math.ceil(total / pageSize),
        hasPrevPage : page > 1,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
    } catch (error) {
        console.error('User orders query error:', error);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

export default router
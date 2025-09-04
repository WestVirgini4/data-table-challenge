export interface User {
    id : number;
    name : string;
    email : string;
    createdAt : string;
}

export interface products {
    id : number;
    name : string;
    price : number;
}

export interface Order {
    id : number ;
    userId : number;
    productId : number;
    amount : number;
    createdAt : string;
}

export interface UserRow extends User {
    orderCount : number;
    orderTotal : number;
}

const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'William', 'Jennifer', 'James', 'Mary', 'Christopher', 'Patricia', 'Daniel',
    'Linda', 'Matthew', 'Elizabeth', 'Anthony', 'Barbara', 'Mark', 'Susan',
    'Donald', 'Jessica', 'Steven', 'Dorothy', 'Andrew', 'Sarah', 'Kenneth', 'Nancy'
]

const lastnames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

const productNames = [
    'Wireless Headphones', 'Smartphone Case', 'Laptop Bag', 'Gaming Mouse',
    'Bluetooth Speaker', 'USB Cable', 'Power Bank', 'Wireless Charger',
    'Screen Protector', 'Keyboard', 'Monitor Stand', 'Desk Lamp',
    'Coffee Mug', 'Water Bottle', 'Notebook', 'Pen Set', 'Backpack',
    'Tablet Stand', 'Phone Holder', 'Camera Lens', 'Memory Card',
    'External Drive', 'Router', 'Webcam', 'Microphone'
]

class DataGenrator {
    private static instance : DataGenrator;
    private users: User[] = [];
    private products : products[] = [];
    private orders : Order[] = [];
    private userRowsCache: UserRow[] = [];
    private userOrderMap: Map<number, {count: number; total: number}> = new Map();
    private rng: () => number;

    private constructor(seed: number = 12345) {
        let seedValue = seed;
        this.rng = () => {
            seedValue = (seedValue * 9301 + 49297) % 233280
            return seedValue / 233280 ;
        };
    }

    public static getInstance(seed? :number): DataGenrator {
        if (!DataGenrator.instance) {
            DataGenrator.instance = new DataGenrator(seed);
        }
        return DataGenrator.instance;
    }

    public generateData(userCount: number, orderCount: number, productCount: number): {
    users: number;
    orders: number;
    products: number;
  } {
    console.log(`🌱 Generating ${userCount} users, ${orderCount} orders, ${productCount} products...`);
    
    this.genaratorUsers(userCount);
    this.genarateProducts(productCount);
    this.generateOrders(orderCount);
    this.precomputeUserRows();

    console.log(`✅ Generated ${this.users.length} users, ${this.orders.length} orders, ${this.products.length} products`);

    return {
      users: this.users.length,
      orders: this.orders.length,
      products: this.products.length
    };
  }

  private genaratorUsers(count: number) : void {
    this.users = [];
    for (let i = 1; i <= count; i++) {
        const firstName = firstNames[Math.floor(this.rng() * firstNames.length)]
        const lastname = lastnames[Math.floor(this.rng() * lastnames.length)]
        const name = `${firstName} ${lastname}`;
        const email = `${firstName.toLowerCase()}.${lastname.toLowerCase()}@example.com`;

        const daysAgo = Math.floor(this.rng() * 730);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 1000).toISOString();

        this.users.push ({
            id : i,
            name,
            email,
            createdAt
        });
    }
  }

  private genarateProducts(count: number): void {
    this.products = [];
    for (let i =1; i <= count; i++) {
        const baseName = productNames[Math.floor(this.rng() * productNames.length)]
        const name = `${baseName} ${i}`;
        const price = Math.floor(this.rng() * 500)+10;

        this.products.push({
            id: i,
            name,
            price
        });
    }
  }

  private generateOrders(count: number): void {
    this.orders = [];
    for (let i =1; i <= count; i++) {
        const userId = Math.floor(this.rng() * this.users.length) + 1
        const productId = Math.floor(this.rng() * this.products.length) + 1
        const product = this.products[productId - 1];
        const amount = Math.floor(this.rng() * 10) + 1;

        const user = this.users[userId - 1];
        const userCreated = new Date(user.createdAt);
        const daySinceUser = Math.floor(this.rng() * Math.floor((Date.now() - userCreated.getTime()) / (24 * 60 * 60 * 1000)));
        const createdAt = new Date(userCreated.getTime() + daySinceUser * 24 * 60 * 60 * 1000).toISOString();

        this.orders.push({
            id:i,
            userId,
            productId,
            amount,
            createdAt
        });

        const orderTotal = amount * product.price;
        const existing = this.userOrderMap.get(userId) || {count: 0, total: 0};
        this.userOrderMap.set(userId, {
            count: existing.count + 1,
            total: existing.total + orderTotal
        });
    }
  }
  private precomputeUserRows(): void {
    this.userRowsCache = this.users.map(user => {
      const orderStats = this.userOrderMap.get(user.id) || { count: 0, total: 0 };
      return {
        ...user,
        orderCount: orderStats.count,
        orderTotal: orderStats.total
      };
    });
  }

  public getUserRows(): UserRow[] {
    return this.userRowsCache;
  }

  public getUserOrders(userId: number): Order[] {
    return this.orders.filter(order => order.userId === userId);
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getProducts(): products[] {
    return this.products;
  }

  public getOrders(): Order[] {
    return this.orders;
  }
}
export default DataGenrator; 
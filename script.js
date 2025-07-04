class Product {
  constructor(
    name,
    price,
    quantity,
    expiry = null,
    requiresShipping = false,
    weight = 0
  ) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.expiry = expiry;
    this.requiresShipping = requiresShipping;
    this.weight = weight;
  }
  isExpired() {
    if (this.expiry) {
      return new Date() > new Date(this.expiry);
    }
    return false;
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  add(product, quantity) {
    if (product.quantity < quantity) {
      console.error(`${product.name} is out of stock.`);
      return;
    }
    if (product.isExpired()) {
      console.error(`${product.name} has expired`);
    }
    this.items.push({ product, quantity });
  }
  checkout(customer) {
    if (this.items.length === 0) {
      console.error("Cart is empty");
      return;
    }

    let subTotal = 0;
    let shippingFees = 0;
    let shippableItems = [];

    for (const { product, quantity } of this.items) {
      subTotal = +product.price * quantity;

      if (product.requiresShipping) {
        for (let i = 0; i < quantity; i++) {
          shippableItems.push({ name: product.name, weight: product.weight });
        }
        shippingFees += 30;
      }
    }

    const totalAmount = subTotal + shippingFees;

    if (customer.balance < totalAmount) {
      console.error("Insufficient balance.");
      return;
    }

    if (shippableItems.length > 0) {
      ShippingService.ship(shippableItems);
    }

    console.log("\n** Checkout receipt");
    this.items.forEach(({ product, quantity }) => {
      const line =
        `${quantity}x ${product.name}`.padEnd(16) +
        `${product.price * quantity}`;
      console.log(line);
    });
    console.log("-".repeat(22));
    console.log(`Subtotal`.padEnd(16) + subTotal);
    console.log(`Shipping`.padEnd(16) + shippingFees);
    console.log(`Amount`.padEnd(16) + totalAmount);

    customer.balance - +totalAmount;
    console.log(`\nCustomer Balance after payment: ${customer.balance}`);
  }
}

class Customer {
  constructor(balance) {
    this.balance = balance;
  }
}

class ShippingService {
  static ship(items) {
    console.log("\n** Shipment notice **");
    const grouped = {};
    let totalWeight = 0;

    for (const item of items) {
      if (!grouped[item.name]) {
        grouped[item.name] = { count: 1, weight: item.weight };
      } else {
        grouped[item.name].count++;
      }
      totalWeight += item.weight;
    }

    for (const [name, data] of Object.entries(grouped)) {
      const line = `${data.count}x ${name}`.padEnd(16) + `${data.weight}g`;
      console.log(line);
    }
    console.log(`Total package weight ${(totalWeight / 1000).toFixed(1)}kg`);
  }
}

const cheese = new Product("Cheese", 100, 10, "2025-12-31", true, 200);
const biscuits = new Product("Biscuits", 150, 10, "2025-12-31", true, 700);
const tv = new Product("TV", 3000, 5, null, true, 5000);
const scratchCard = new Product("ScratchCard", 50, 10, null, false);

const customer = new Customer(10000);
const cart = new Cart();

cart.add(cheese, 2);
cart.add(tv, 3);
cart.add(scratchCard, 1);

cart.checkout(customer);

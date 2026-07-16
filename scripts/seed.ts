import bcrypt from "bcryptjs";

import { products } from "../lib/data";
import { prisma } from "../lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const userPassword = await bcrypt.hash("User@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Marketplace Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      password: userPassword
    }
  });

  const seededProducts = new Map<string, Awaited<ReturnType<typeof prisma.product.upsert>>>();

  for (const product of products) {
    const { id: _ignoredId, ...productData } = product;

    const seededProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData
    });

    seededProducts.set(product.slug, seededProduct);
  }

  const defaultAddressData = {
    userId: user.id,
    fullName: "Demo Customer",
    phone: "+91 98765 43210",
    line1: "221B Indiranagar Main Road",
    line2: "Near Metro Station",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    isDefault: true
  };

  const existingDefaultAddress = await prisma.address.findFirst({
    where: { userId: user.id, isDefault: true }
  });

  if (existingDefaultAddress) {
    await prisma.address.update({
      where: { id: existingDefaultAddress.id },
      data: defaultAddressData
    });
  } else {
    await prisma.address.create({
      data: defaultAddressData
    });
  }

  const firstProduct = seededProducts.get(products[0].slug);
  const secondProduct = seededProducts.get(products[2].slug);

  if (!firstProduct || !secondProduct) {
    throw new Error("Seeded products were not found after upsert.");
  }

  const orderData = {
    userId: user.id,
    status: "DELIVERED" as const,
    paymentStatus: "PAID" as const,
    subtotal: firstProduct.price + secondProduct.price,
    shipping: 0,
    tax: Math.round((firstProduct.price + secondProduct.price) * 0.18),
    total: firstProduct.price + secondProduct.price + Math.round((firstProduct.price + secondProduct.price) * 0.18),
    shippingFullName: "Demo Customer",
    shippingPhone: "+91 98765 43210",
    shippingLine1: "221B Indiranagar Main Road",
    shippingLine2: "Near Metro Station",
    shippingCity: "Bengaluru",
    shippingState: "Karnataka",
    shippingPincode: "560038"
  };

  const orderItems = [
    {
      productId: firstProduct.id,
      title: firstProduct.title,
      image: firstProduct.images[0],
      price: firstProduct.price,
      quantity: 1
    },
    {
      productId: secondProduct.id,
      title: secondProduct.title,
      image: secondProduct.images[0],
      price: secondProduct.price,
      quantity: 1
    }
  ];

  const existingOrder = await prisma.order.findFirst({
    where: {
      shippingPhone: "+91 98765 43210",
      status: "DELIVERED"
    }
  });

  const order = existingOrder
    ? await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          ...orderData,
          items: {
            deleteMany: {},
            create: orderItems
          }
        }
      })
    : await prisma.order.create({
        data: {
          ...orderData,
          items: {
            create: orderItems
          }
        }
      });

  console.log(`Seeded ${products.length} products`);
  console.log(`Admin login: admin@example.com / Admin@123`);
  console.log(`Customer login: customer@example.com / User@123`);
  console.log(`Demo order: ${order.id}`);
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

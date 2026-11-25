import { EcommerceOrder, EcommerceOrderStatus, EcommerceCompany } from "../types/ecommerce.types";
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted } from "@/lib/storageSync";

export const SAMPLE_ORDERS: EcommerceOrder[] = [
  {
    id: "ord-tech-1001",
    orderNumber: "ORD-STR-2026-001",
    companyId: "tech",
    clientName: "Rahul Sharma",
    businessName: "Apex Retailers Ltd",
    email: "rahul.sharma@apexretail.in",
    phone: "+91 98300 12345",
    address: "42 Park Street, 4th Floor",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700016",
    gstNumber: "19ABCDE1234F1Z5",
    items: [
      {
        serviceId: "prod-tech-onepage",
        name: "One Page Website",
        price: 4999,
        qty: 1,
        priceType: "one-time",
        deliveryDays: "3-5 Days",
        technologiesUsed: ["Next.js", "Tailwind CSS", "Vercel"]
      }
    ],
    totalAmount: 4999,
    status: "Order Pending",
    orderDate: "2026-11-24",
    clientPassword: "Client@123",
    notes: "Client requested WhatsApp click-to-chat button on homepage.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "ord-tech-1002",
    orderNumber: "ORD-STR-2026-002",
    companyId: "tech",
    clientName: "Priyanka Roy",
    businessName: "Glow Beauty Cosmetics",
    email: "priyanka.roy@glowbeauty.com",
    phone: "+91 98311 54321",
    address: "15 Salt Lake Sector V",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    gstNumber: "19FGHIJ5678K2Z9",
    items: [
      {
        serviceId: "prod-tech-ecommerce",
        name: "Full Stack E-Commerce Platform",
        price: 19999,
        qty: 1,
        priceType: "one-time",
        deliveryDays: "10-14 Days",
        technologiesUsed: ["Next.js 15", "Node.js", "MySQL", "Razorpay"]
      }
    ],
    totalAmount: 19999,
    status: "Order Pending",
    orderDate: "2026-11-23",
    clientPassword: "Client@123",
    notes: "Razorpay payment gateway ready for live credential linking.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "ord-consult-2001",
    orderNumber: "ORD-SCS-2026-001",
    companyId: "consultancy",
    clientName: "Vikram Sengupta",
    businessName: "Horizon Logistics LLP",
    email: "vikram@horizonlogistics.co",
    phone: "+91 98322 98765",
    address: "20 Strand Road",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700001",
    gstNumber: "19KLMNO9012P3Z4",
    items: [
      {
        serviceId: "prod-consult-incorporation",
        name: "Private Limited Company Incorporation & Legal Setup",
        price: 8999,
        qty: 1,
        priceType: "one-time",
        deliveryDays: "7-10 Days"
      }
    ],
    totalAmount: 8999,
    status: "Order Pending",
    orderDate: "2026-11-24",
    clientPassword: "Client@123",
    notes: "MOA & AOA draft required for 2 directors.",
    updatedAt: new Date().toISOString()
  }
];

export async function getEcommerceOrders(companyScope?: string | null): Promise<EcommerceOrder[]> {
  try {
    const scope = (companyScope || "tech").toLowerCase().trim();
    const isConsult = scope === "2" || scope === "consultancy" || scope.includes("consult");
    const isTech = scope === "1" || scope === "tech" || scope.includes("tech");
    const isAll = !scope || scope === "all" || scope === "group" || scope === "saampark-group";

    if (isAll) {
      const techOrders = await fetchModuleDataFromDB<EcommerceOrder[]>("ecommerce_orders", SAMPLE_ORDERS.filter(o => o.companyId === "tech"), "tech");
      const consultOrders = await fetchModuleDataFromDB<EcommerceOrder[]>("ecommerce_orders", SAMPLE_ORDERS.filter(o => o.companyId === "consultancy"), "consultancy");
      
      const combined = [
        ...(Array.isArray(techOrders) ? techOrders : SAMPLE_ORDERS.filter(o => o.companyId === "tech")),
        ...(Array.isArray(consultOrders) ? consultOrders : SAMPLE_ORDERS.filter(o => o.companyId === "consultancy"))
      ];
      const map = new Map<string, EcommerceOrder>();
      combined.forEach(o => { if (o && o.id) map.set(o.id, o); });
      return Array.from(map.values()).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    const targetScope = isConsult ? "consultancy" : "tech";
    const defaultScopeOrders = SAMPLE_ORDERS.filter(o => o.companyId === targetScope);

    const data = await fetchModuleDataFromDB<EcommerceOrder[]>("ecommerce_orders", defaultScopeOrders, targetScope);
    if (Array.isArray(data) && data.length > 0) {
      return data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    await saveModuleDataToDB("ecommerce_orders", defaultScopeOrders, targetScope);
    return defaultScopeOrders;
  } catch (err) {
    console.warn("getEcommerceOrders error:", err);
    return SAMPLE_ORDERS;
  }
}

export async function saveEcommerceOrder(order: EcommerceOrder): Promise<EcommerceOrder> {
  const compScope = (order.companyId || "tech").toLowerCase().trim();
  const currentList = await getEcommerceOrders(compScope);

  const existingIdx = currentList.findIndex(o => o.id === order.id);
  let updatedList: EcommerceOrder[];

  const updatedOrder: EcommerceOrder = {
    ...order,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = updatedOrder;
  } else {
    updatedList = [updatedOrder, ...currentList];
  }

  await saveModuleDataToDB("ecommerce_orders", updatedList, compScope);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_orders_updated"));
  }

  return updatedOrder;
}

export async function updateOrderStatus(
  orderId: string, 
  status: EcommerceOrderStatus, 
  invoiceDetails?: { invoiceId?: string; invoiceNumber?: string; invoiceUrl?: string; clientUserId?: string }
): Promise<EcommerceOrder | null> {
  // Check in tech first, then consultancy
  for (const scope of ["tech", "consultancy"]) {
    const orders = await getEcommerceOrders(scope);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated: EcommerceOrder = {
        ...order,
        status,
        ...(invoiceDetails?.invoiceId ? { invoiceId: invoiceDetails.invoiceId } : {}),
        ...(invoiceDetails?.invoiceNumber ? { invoiceNumber: invoiceDetails.invoiceNumber } : {}),
        ...(invoiceDetails?.invoiceUrl ? { invoiceUrl: invoiceDetails.invoiceUrl } : {}),
        ...(invoiceDetails?.clientUserId ? { clientUserId: invoiceDetails.clientUserId } : {}),
        updatedAt: new Date().toISOString()
      };
      await saveEcommerceOrder(updated);
      return updated;
    }
  }
  return null;
}

export async function deleteEcommerceOrder(orderId: string, companyScope: string): Promise<boolean> {
  const compScope = (companyScope || "tech").toLowerCase().trim();
  await markGlobalItemDeleted(orderId, "ecommerce_orders");

  const currentList = await getEcommerceOrders(compScope);
  const filtered = currentList.filter(o => o.id !== orderId);

  await saveModuleDataToDB("ecommerce_orders", filtered, compScope);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_orders_updated"));
  }

  return true;
}

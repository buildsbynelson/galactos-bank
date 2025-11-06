import { prisma } from "@/lib/prisma";

// Generates a unique 8-digit account number
export async function generateAccountNumber(): Promise<string> {
  let attempts = 0;
  
  while (attempts < 10) {
    // Generate 8-digit number (10000000 to 99999999)
    const accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Check if it already exists
    const exists = await prisma.user.findUnique({
      where: { accountNumber }
    });
    
    if (!exists) {
      return accountNumber;
    }
    
    attempts++;
  }
  
  throw new Error("Failed to generate unique account number");
}

// Generates transaction reference like "TXN-ABC123"
export function generateTransactionRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}${random}`;
}
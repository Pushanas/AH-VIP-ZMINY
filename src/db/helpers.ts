import { db } from './index.ts';
import { vipCodes, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to register or retrieve user:", error);
    throw new Error("Failed to process user authentication.", { cause: error });
  }
}

export async function getAllVipCodes() {
  try {
    return await db.select().from(vipCodes).orderBy(desc(vipCodes.createdAt));
  } catch (error) {
    console.error("Failed to fetch VIP codes:", error);
    throw new Error("Failed to retrieve activation codes.", { cause: error });
  }
}

export async function createVipCode(data: {
  code: string;
  type: string;
  durationDays: number;
  expiresAt: Date | null;
  maxUses: number;
}) {
  try {
    const result = await db.insert(vipCodes)
      .values({
        code: data.code,
        type: data.type,
        durationDays: data.durationDays,
        expiresAt: data.expiresAt,
        maxUses: data.maxUses,
        usedCount: 0,
        status: 'active',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to create VIP code:", error);
    throw new Error("Failed to generate activation code.", { cause: error });
  }
}

export async function updateVipCodeStatus(codeStr: string, nextStatus: string) {
  try {
    const result = await db.update(vipCodes)
      .set({ status: nextStatus })
      .where(eq(vipCodes.code, codeStr))
      .returning();
    return result[0];
  } catch (error) {
    console.error(`Failed to update status for code ${codeStr}:`, error);
    throw new Error("Failed to update activation code status.", { cause: error });
  }
}

export async function deleteVipCode(codeStr: string) {
  try {
    const result = await db.delete(vipCodes)
      .where(eq(vipCodes.code, codeStr))
      .returning();
    return result[0];
  } catch (error) {
    console.error(`Failed to delete code ${codeStr}:`, error);
    throw new Error("Failed to delete activation code.", { cause: error });
  }
}

export async function verifyAndUseCode(codeStr: string) {
  try {
    const records = await db.select().from(vipCodes).where(eq(vipCodes.code, codeStr));
    if (records.length === 0) {
      return { success: false, errorType: 'invalid' };
    }

    const codeObj = records[0];

    if (codeObj.status === 'disabled') {
      return { success: false, errorType: 'disabled' };
    }

    if (codeObj.status === 'used' || codeObj.usedCount >= codeObj.maxUses) {
      return { success: false, errorType: 'used' };
    }

    if (codeObj.expiresAt) {
      const expiry = new Date(codeObj.expiresAt);
      if (expiry < new Date()) {
        // Automatically mark as expired in DB
        await db.update(vipCodes).set({ status: 'expired' }).where(eq(vipCodes.code, codeStr));
        return { success: false, errorType: 'expired' };
      }
    }

    // Code is valid! Update use stats
    let nextUsedCount = codeObj.usedCount + 1;
    let nextStatus = codeObj.status;

    if (codeObj.type === 'single_use' || nextUsedCount >= codeObj.maxUses) {
      nextStatus = 'used';
    }

    const updated = await db.update(vipCodes)
      .set({
        usedCount: nextUsedCount,
        status: nextStatus,
      })
      .where(eq(vipCodes.code, codeStr))
      .returning();

    return { success: true, code: updated[0] };
  } catch (error) {
    console.error(`Failed to verify and use code ${codeStr}:`, error);
    throw new Error("Failed to verify activation code.", { cause: error });
  }
}

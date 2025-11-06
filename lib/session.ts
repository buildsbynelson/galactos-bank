import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const sessionToken = (await cookies()).get("session-token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (new Date() > session.expires) {
    await prisma.session.delete({
      where: { sessionToken },
    });
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
  };
}

export async function deleteSession() {
  const sessionToken = (await cookies()).get("session-token")?.value;

  if (sessionToken) {
    await prisma.session.delete({
      where: { sessionToken },
    }).catch(() => {});
  }

  (await cookies()).delete("session-token");
}
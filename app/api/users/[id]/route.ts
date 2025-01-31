import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Explicitly define context type correctly
interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // Extract ID correctly

    if (!id) {
      return NextResponse.json({ error: "Missing or invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

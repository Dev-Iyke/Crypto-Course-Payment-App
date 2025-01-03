import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing or invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
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



// const fetchUserData = async () => {
//   const userId = localStorage.getItem("userId");

//   if (!userId) {
//     alert("User not found. Redirecting to signup...");
//     window.location.href = "/signup";
//     return;
//   }

//   const response = await fetch(`/api/users/${userId}`);
//   if (response.ok) {
//     const userData = await response.json();
//     setUser(userData);
//   } else {
//     alert("Failed to fetch user data");
//   }
// };
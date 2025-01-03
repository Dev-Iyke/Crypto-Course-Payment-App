import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user data" }),
      { status: 500 }
    );
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
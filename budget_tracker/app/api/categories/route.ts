import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return;
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");

  // Validate the "type" parameter
  const validator = z.enum(["expense", "income"]).nullable();
  const queryParams = validator.safeParse(paramType);

  if (!queryParams.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid 'type' parameter",
        details: queryParams.error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const type = queryParams.data;

  // Fetch categories from Prisma
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        ...(type && { type }), // Include "type" in filters if it's defined
      },
      orderBy: {
        name: "asc",
      },
    });

    // Return categories as JSON
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch categories",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

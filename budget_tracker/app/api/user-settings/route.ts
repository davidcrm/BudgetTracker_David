import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-up", request.url));
  }

  try {
    let userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          currency: "EUR",
        },
      });
    }
    revalidatePath("/")
    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error fetching or creating user settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch or create user settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

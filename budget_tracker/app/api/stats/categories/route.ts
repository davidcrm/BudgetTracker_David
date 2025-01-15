import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request:Request){
  const user = await currentUser();

  if(!user){
    redirect("/sign-in");
  };

  const {searchParams} = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  console.log("Parsed search params:", { from, to });
  const queryParams = OverviewQuerySchema.safeParse({from,to});

  if (!queryParams.success){
    console.error("Schema validation failed:", queryParams.error.message);
    throw new Error(queryParams.error.message)
  }

  const stats = await getCategoriesStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  )
  
  return NextResponse.json(stats)
}

export type getCategoriesStatsResponseType = Awaited<ReturnType<typeof getCategoriesStats>>

async function getCategoriesStats(userId: string, from: Date,to: Date){
  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "icon"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      }
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum:{
        amount: "desc"
      }
    }
  });
  return stats;
}
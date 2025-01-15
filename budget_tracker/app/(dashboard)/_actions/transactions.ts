"use server"

import prisma from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form : CreateTransactionSchemaType){

  const parsedBody = CreateTransactionSchema.safeParse(form)
  

  if (!parsedBody.success){
    throw new Error(parsedBody.error.message)
  }

  const user = await currentUser()
  if (!user){
    redirect("/sign-in")
  }

  const { amount, category, date, description, type} = parsedBody.data;
  
  const categoryRow = await prisma.category.findFirst({
    where: {
      userId : user.id,
      name: category,
    }
  });

  if ( !categoryRow) {
    throw new Error("categoría no encontrada")
  }
  // $transaction es para la base de datos y transaction es para la tabla
  await prisma.$transaction([
    // Crear la transaccion del usuario
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        descrption: description || "",
        type,
        category: categoryRow.name,
        icon: categoryRow.icon,
      },
    }),
    // Actualizar la tabla agregada monthAggregate
    prisma.monthHistory.upsert({
      // Busca si la transacción ha sido añadida
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      // si no ha sido añadida la crea
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      // y si ha sido añadida la actualiza
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        }
      }
    }),
    // Actualizar la tabla agregada yearAggregate

    prisma.yearHistory.upsert({
      // Busca si la transacción ha sido añadida
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      // si no ha sido añadida la crea
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      // y si ha sido añadida la actualiza
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        }
      }
    }),
  ]);
}

"use client";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { ReactNode, useCallback, useState } from "react";
import React from 'react'
import {zodResolver} from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {es} from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { CreateTransaction } from "../_actions/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { CreateCategorySchemaType } from "@/schema/categories";
import { DateToUTCDate } from "@/lib/helpers";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

function CreateTransactionDialog({trigger, type}: Props) {

  const form  = useForm<CreateTransactionSchemaType>({
    resolver:zodResolver(CreateTransactionSchema),
    defaultValues: {
      type: type,
      date: new Date()
    }
  });

  const [open, setOpen] = useState(false);

  const handleCategoryChange = useCallback((value: string) => {
    form.setValue("category", value);
  }, [form]);


  const queryClient= useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("La transacción se ha creado correctamente! 🎉", {
        id: "create-transaction"
      });
  
      form.reset({
        type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
      });
  
      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });

      setOpen((prev) => !prev)
    },
  });
  
  

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Creando la transacción..."),{
        id: "create-transaction"
      };
  
      mutate(
        {
          ...values,
          date: DateToUTCDate(values.date),
        });
    },
    [mutate]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Crear un nuevo{" "}
            <span className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>
              {type}
            </span>
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form  className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Añadir descripción..." defaultValue={""} />
                  </FormControl>
                  <FormDescription>
                    Descripción de la transacción (opcional)
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Añadir cantidad..." defaultValue={""} type="number" />
                  </FormControl>
                  <FormDescription>
                    Cantidad de la transacción (obligatorio)
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                   <CategoryPicker type = {type} onChange={handleCategoryChange}/>
                  </FormControl>
                  <FormDescription>
                    Elige una categoría (obligatorio)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-[150px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")} >
                          {field.value ? (format(field.value, "dd / MMM / yyyy", {locale: es})) : (<span>Elige una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                      mode="single" 
                      selected={field.value}
                      onSelect={(value) => {if (!value) return; field.onChange(value)}}
                      initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Elige una fecha (obligatorio)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </form>
          <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant={"secondary"} onClick={() =>{
                  form.reset()
                }}> Cancelar</Button>
              </DialogClose>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                {!isPending && "Create"}
                {isPending && <Loader2 className="animate-spin"/>}
              </Button>
            </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog
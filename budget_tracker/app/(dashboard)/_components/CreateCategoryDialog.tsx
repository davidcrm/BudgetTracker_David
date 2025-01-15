"use client"
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { Category } from '@prisma/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';


interface Props{
  type: TransactionType;
  SuccessCallback: (category: Category) => void;
}

function CreateCategoryDialog({type, SuccessCallback}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    }
  });

  const queryClient = useQueryClient();
  const theme = useTheme();

  const {mutate, isPending} = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      })
      toast.success(`Categoría ${data.name} creada correctamente 🎉`),{
        id: "create-category"
      }
      SuccessCallback(data);

    await queryClient.invalidateQueries({
      queryKey: ["categories"]
    });

    setOpen((prev) => !prev)
    },

    onError: () =>{
      toast.error("Algo ha ido mal"), {
        id: "create-category"
      }
    }
  });

  const onSubmit = useCallback((values: CreateCategorySchemaType) => {
    toast.loading("Creando la categoría", {
      id: "create-category",
    });
    mutate(values);
  }, [mutate])

  return (
    <Dialog open= {open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
        variant={'ghost'} className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'>
            <PlusSquare className='mr-2 h-4 w-4'/>
            Crear nueva
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Crear {" "} <span className={cn('m-1', type === 'income'  ? "text-emerald-500" : "text-red-500")}>{type}</span>
          </DialogTitle>
          <DialogDescription>
            Las categorías se usan para agrupar tus transacciones.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Añadir nombre..." />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={'outline'} className='h-[100px] w-full'>
                            {form.watch("icon") ?
                            <div className='flex flex-col items-center gap-2'>
                              <span className='text-5xl' role='img'>{field.value}</span>
                               <p className="text-xs text-muted-foreground">Cambiar</p>
                            </div> : 
                            <div className='flex flex-col items-center gap-2'>
                              <CircleOff className='h-[48px] w-[48px]'></CircleOff>
                              <p className="text-xs text-muted-foreground">Pulsa para seleccionar</p>
                            </div>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full'>
                        <Picker theme={theme.resolvedTheme} data={data} onEmojiSelect={(emoji: {native: string}) => field.onChange(emoji.native)}/>
                      </PopoverContent>
                    </Popover>
                  </FormControl>  
                  <DialogDescription>
                    Así aparecerán tus categorías en la aplicación.
                  </DialogDescription>
                </FormItem>
              )}
            />
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
          </form>
          
        </Form>
        
      </DialogContent>
    </Dialog>
  )
}

export default CreateCategoryDialog
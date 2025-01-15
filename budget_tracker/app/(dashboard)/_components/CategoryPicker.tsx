import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { Category } from '@prisma/client';
import { PopoverContent } from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react'
import CreateCategoryDialog from './CreateCategoryDialog';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';


interface Props {
  type: TransactionType,
  onChange: (value: string) => void,
}

function CategoryPicker({type, onChange}: Props) {
  const [open,setOpen]= useState(false);
  const [value, setValue] = useState("");

  useEffect(() => 
  {if (!value) return;
    onChange(value); // Cuando cambia el valor, llama a la funcion onChange
  }, [onChange, value])
  
  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () => fetch(`/api/categories?type=${type}`).then((res) => res.json())
  })
  
  const selectedCategory = categoriesQuery.data?.find(
    (category: Category) => category.name === value
  )

  const successCallback = useCallback((category: Category) => {
    setValue(category.name),
    setOpen((prev) => !prev)
  }, [setValue, setOpen]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'outline'}
        role='combobox'
        aria-expanded={open}
        className='w-[200px] justify-between'>
          {selectedCategory ? (
            <CategoryRow category={selectedCategory}/>
          ) : (
            "Select category"
          )}
          <ChevronsUpDown className='ml-2 h-4 2-4 shrink-0 opacity-50'/>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command onSubmit={e => {
          e.preventDefault()
        }} >
          <CommandInput placeholder='Busca tu categoría'/>
          <CreateCategoryDialog type={type} SuccessCallback={successCallback}/>
          <CommandEmpty>
            <p>Categoría no encontrada</p>
            <p className='text-xs text-muted-foreground'>
              Crea una nueva categoría.
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {
              categoriesQuery.data && categoriesQuery.data.map((category: Category) => (
                <CommandItem 
                  key={category.name} 
                  onSelect={() => {
                    setValue(category.name);
                    setOpen((prev) => !prev)
                  }}
                >
                  <CategoryRow category={category}/>
                    <Check className={cn(
                      "mr-2 w2- h-4 opacity-0",
                      value === category.name && "opacity-100"
                    )}/>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
    
  )
}

export default CategoryPicker

function CategoryRow({category}: {category:Category}){
  return ( 
    <div className="flex items-center gap-2">
      <span role='img'>{category.icon}</span>
      <span>{category.name}</span>
    </div>
  )
}
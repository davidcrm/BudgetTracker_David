"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Currencies, Currency} from "@/lib/currencies"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { UserSettings } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings"
import { toast } from "sonner"


export function CurrencyComboBox() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<Currency | null>(null);

  const userSettings = useQuery<UserSettings>({
    queryKey: ['userSettings'],
    queryFn: async () => fetch("api/user-settings").then((res) => res.json()),
  })
  useEffect(()=> {
    if (!userSettings.data) return;
    const userCurrency = Currencies.find((currency) => currency.value === userSettings.data.currency)

    if (userCurrency){
      setValue(userCurrency)
    }
  },[userSettings.data])

  const mutation = useMutation({
    mutationFn: UpdateUserCurrency,
    onSuccess: (data: UserSettings) => {
      toast.success('Se ha actualizado la divisa correctamente 🎉', {
        id: 'update-currency',
      });
      setValue(
        Currencies.find((c) => c.value === data.currency) || null
      );
    },
    onError: (e) => {
      toast.error('Algo ha ido mal', {
        id: 'update-currency'
      })
    }
  });

  const selectOption = useCallback((currency: Currency) =>{
    if (!value){
      toast.error('Seleccione una divisa')
    }
    toast.loading("Actualizando la divisa...", {
      id: "update-currency",
    });
    mutation.mutate(currency.value)
  }, [mutation]);

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={mutation.isPending}
          >
            {value ? value.label : "Elige tu divisa..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Busca tu divisa..." className="h-9" />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {Currencies.map((currency) => (
                  <CommandItem
                    key={currency.value}
                    onSelect={() => {
                      setValue(currency)
                      setOpen(false)
                      selectOption(currency)
                    }}
                  >
                    {currency.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value?.value === currency.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </SkeletonWrapper>
  )
}

"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { UserSettings } from '@prisma/client'
import { differenceInDays, setDate, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import StatsCards from './StatsCards';
import CategoriesStats from './CategoriesStats';

function Overview({userSettings}:{userSettings: UserSettings}) {
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  return (
    <>
    <div className="px-6 flex flex-wrap justify-between items-end gap-2 py-6">
      <h2 className='text-3xl font-bold'>Overview</h2>
      <div className="flex items-center gap-3">
        <DateRangePicker
        initialDateFrom={dateRange.from}
        initialDateTo={dateRange.to}
        showCompare={false}
        onUpdate={values => {
          const {from, to} = values.range;
          // actualiza el rango solo si existen ambas fechas

          if (!from || !to) return;
          if (differenceInDays(to,from) > MAX_DATE_RANGE_DAYS){
            toast.error(`el rango seleccionado es muy grande. El maximo es de ${MAX_DATE_RANGE_DAYS} días`
          );
          return;
          };
          setDateRange({from, to})
        }}
        />
      </div>
    </div>
    <div className=" pl-10 pr-10 flex w-full flex-col gap-2">
       <StatsCards
      userSettings={userSettings}
      from= {dateRange.from}
      to= {dateRange.to}/>
    </div>
    <CategoriesStats  
      userSettings={userSettings}
      from= {dateRange.from}
      to= {dateRange.to}
      />
    </>
  )
}

export default Overview
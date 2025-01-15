"use client";

import React, { ReactNode, useCallback, useMemo } from 'react'
import {UserSettings} from '@prisma/client'
import { useQuery } from '@tanstack/react-query';
import { getBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import { DateToUTCDate, GetFormattedForCurrency } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from 'react-countup'

interface Props{
  from: Date,
  to: Date,
  userSettings : UserSettings;
}

function StatsCards({from, to, userSettings}: Props) {
  const statsQuery = useQuery<getBalanceStatsResponseType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: () => 
        fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
            .then((res) => res.json()),
    
  });
  const formatter = useMemo(() => {
    return GetFormattedForCurrency(userSettings.currency)
  },[userSettings.currency])
  
  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;

  const balance = income - expense;

   return (
      <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
        <SkeletonWrapper isLoading={statsQuery.isFetching}>
          <StatCard 
            formatter= {formatter} 
            value={income} 
            title="Ingresos" 
            icon={<TrendingUp className='h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10'/>}
          />
          <StatCard 
            formatter= {formatter} 
            value={expense} 
            title="Gastos" 
            icon={<TrendingDown className='h-12 w-12 items-center rounded-lg p-2 text-rose-500 bg-rose-400/10'/>}
          />
          <StatCard 
            formatter= {formatter}
            value={balance} 
            title="Balance" 
            icon={<Wallet className='h-12 w-12 items-center rounded-lg p-2 text-yellow-500 bg-yellow-400/10'/>}
            />
        </SkeletonWrapper>

      </div>
  )
}

export default StatsCards

function StatCard({formatter, value, title, icon}: {
  formatter: Intl.NumberFormat;
  icon: ReactNode;
  title: string;
  value: number;
}){
  const formatFn = useCallback((value: number) => {
    return formatter.format(value);
  }, [formatter]);

  return(
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className='flex flex-col items-center gap-0'>
        <p className="text-muted-foreground"> {title}</p>
        <CountUp
          preserveValue
          redraw= {false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className='text-2xl'
        />
      </div>
    </Card>
  )
}
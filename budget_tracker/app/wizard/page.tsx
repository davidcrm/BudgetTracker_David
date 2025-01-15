import { CurrencyComboBox } from '@/components/CurrencyComboBox'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { currentUser } from '@clerk/nextjs/server'
import { Separator } from '@radix-ui/react-dropdown-menu'
import Link from 'next/dist/client/link'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  const user = await currentUser()
  if (!user){
    redirect('/sign-in')
  }
  return <div className="container flex max-w-2x1 flex-col items-center justify-between gap-4">
    <div>
      <h1 className='text-center text-3x1'>
        Bienvenido, <span className='m1-2 font-bold'> {user.firstName}  👋🏼!</span>
      </h1>
      <h2 className='mt-4 text-center text-base text-base-foregoround'>
        Empecemos configurando tu divisa.
      </h2>
      <h3 className='mt-2 text-center text-sm text-muted-foreground'>
        Puedes cambiar estos ajustes en cualquier momento.
      </h3>
    </div>
    <div>
      <Separator/>
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Divisa</CardTitle>
        <CardDescription> Elige la divisa en la que quieres mostrar las transacciones</CardDescription>
      </CardHeader>
      <CardContent>
        <CurrencyComboBox />
      </CardContent>
    </Card>
    <Separator/>
    <Button className='w-full' asChild>
      <Link href={"/"}> Listo, llévame al Dashboard</Link>
    </Button>
    </div>
    <div className='mt-8'>
      <Logo/>
    </div>
  </div>
}

export default page
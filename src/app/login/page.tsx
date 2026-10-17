import type { Metadata } from 'next'
import Image from 'next/image'
import { HuecoIlustracion } from '@/components/hueco'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Ingresar' }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh md:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden banda text-white md:flex md:flex-col md:justify-between md:p-12 lg:p-16">
        <Image src="/logo/ads-logo.png" alt="Ascensores del Sur" width={92} height={51} className="relative z-10" priority />
        <HuecoIlustracion className="absolute right-[6%] top-1/2 hidden h-[86%] -translate-y-1/2 text-white xl:block" />
        <div className="relative z-10 xl:max-w-[55%]">
          <p className="font-serif text-[40px] font-extrabold leading-[1] tracking-[-0.01em] lg:text-[52px] xl:text-[62px]">
            Cada obra, de la primera llamada <em className="not-italic text-naranja">a la puesta en marcha.</em>
          </p>
          <p className="mt-6 text-[14px] text-white/50">Presupuestos y obras de ADS · Unidad Obras</p>
        </div>
      </section>

      <section className="flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-[360px]">
          <Image src="/logo/ads-logo.png" alt="Ascensores del Sur" width={72} height={40} className="mb-10 md:hidden" priority />
          <h1 className="font-serif text-[40px] font-extrabold leading-none text-ink">Ingresar</h1>
          <p className="mt-2 text-[14px] text-ink-3">Con tu usuario de ADS Obras.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}

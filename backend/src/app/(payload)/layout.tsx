import type { ReactNode } from 'react'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import '@payloadcms/next/css'
import { importMap } from './importMap'

const configPromise = import('@payload-config').then(({ default: config }) => config)

type Props = {
  children: ReactNode
}

async function serverFunction(args: { name: string; args: Record<string, unknown> }) {
  'use server'

  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

const Layout = ({ children }: Props) =>
  RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  })

export default Layout

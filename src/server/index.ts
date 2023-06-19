/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Env } from 'hono'
import { h, options as preactOptions } from 'preact'
import { Serializer } from './serializer'
import { Server } from './server'
import type { Hono, Route, AppHandler, ReservedHandler, FC } from '../types'

type CreateAppOptions = Partial<{
  app: Hono
  PRESERVED: Record<string, unknown>
  FILES: Record<string, unknown>
  root: string
}>

export function createApp<E extends Env>(options?: CreateAppOptions) {
  const server = options
    ? new Server({
        FILES: options.FILES as Record<string, { default: FC; app?: AppHandler }>,
        PRESERVED: options.PRESERVED as Record<string, { default: ReservedHandler }>,
        root: options.root,
      })
    : new Server()
  return server.createApp<E>({ app: options?.app })
}

export function defineRoute(route: Route) {
  return route
}

import type { Polar } from '@polar-sh/sdk'
import { env } from 'cloudflare:workers'

let _polar: Polar | null = null

export async function getPolar(): Promise<Polar> {
  if (!_polar) {
    const { Polar } = await import('@polar-sh/sdk')
    _polar = new Polar({
      accessToken: env.POLAR_SECRET,
      server: 'sandbox',
    })
  }
  return _polar
}

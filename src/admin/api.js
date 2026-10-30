export async function api(path, { method = 'GET', body, formData } = {}) {
  let res
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: formData || (body ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new Error('Serveur injoignable. Vérifiez qu’il est bien démarré.')
  }
  const isJson = res.headers.get('content-type')?.includes('json')
  const data = isJson ? await res.json() : null
  if (res.status === 401 && path !== '/login') window.dispatchEvent(new Event('baari:session-expired'))
  if (!res.ok) throw new Error(data?.error || 'Serveur injoignable. Vérifiez qu’il est bien démarré.')
  return data
}

export const imgUrl = (src) => (!src || src.startsWith('/') ? src : `/${src}`)

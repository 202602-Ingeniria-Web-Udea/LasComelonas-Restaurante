import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// La versión de la plantilla llamaba setState dentro de un useEffect y el lint de
// Next 16 lo marca como error. useSyncExternalStore es la forma recomendada por React
// para leer un valor del navegador (aquí, el ancho de la pantalla) y escuchar sus cambios.
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    // En el servidor no hay ventana: se asume escritorio, como hacía la plantilla.
    () => false
  )
}

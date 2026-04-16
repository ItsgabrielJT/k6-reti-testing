# Conclusiones del Ejercicio

## Resultado General

La ejecución más reciente de la suite de login con k6 fue funcionalmente exitosa, pero no cumplió de forma completa los umbrales definidos para latencia bajo una carga superior a 20 TPS.

- Feature ejecutada: `tests/login-smoke.js`
- Escenarios ejecutados: 1
- Escenarios exitosos: 0
- Escenarios fallidos: 1
- Tiempo total de la ejecución: ~51.6 s
- Ejecución en paralelo: entre 6 y 37 VUs, con 20 VUs preasignados y 60 VUs máximos

## Hallazgos Principales

### 1. El cambio a carga controlada por tasa sí permitió sostener el objetivo de al menos 20 TPS

La configuración inicial basada en stages no garantizaba un throughput mínimo estable de 20 transacciones por segundo. Al migrar el escenario a `constant-arrival-rate`, la suite pasó a generar una carga constante y medible durante toda la ventana de ejecución.

Esto permitió:

- Garantizar una tasa objetivo superior al umbral mínimo requerido
- Medir el comportamiento del endpoint bajo carga sostenida
- Evitar resultados variables dependientes solo del ramp-up de usuarios virtuales
- Alinear el diseño de la prueba con un criterio explícito de TPS

En la ejecución más reciente, la prueba alcanzó:

- `http_reqs = 20.01671/s`
- `iterations = 1032`

### 2. Las validaciones funcionales debían ajustarse al comportamiento real del endpoint

La prueba estaba validando `status is 200`, pero el endpoint público de login devuelve `201` cuando la autenticación es exitosa. Eso provocaba fallos funcionales falsos, aunque la respuesta contenía el token esperado.

El ajuste de la validación permitió:

- Reflejar el comportamiento real de la API
- Eliminar falsos negativos en los checks
- Mantener la verificación funcional relevante sobre autenticación exitosa

En la ejecución más reciente se confirmó que:

- `status is 200 or 201` pasó al 100%
- `token exists` pasó al 100%
- `token is not empty` pasó al 100%

### 3. El endpoint público no mantuvo de forma estable el criterio de latencia

Aunque la autenticación siguió funcionando correctamente y no se registraron errores HTTP, el endpoint presentó degradación en tiempos de respuesta cuando la prueba exigió más de 20 TPS sostenidos.

Esto fue útil para comprobar de forma explícita que:

- La API soporta una carga superior a 20 TPS en este escenario
- El p95 no se mantiene de forma consistente por debajo del umbral esperado
- La tasa de error observada es menor al 3% permitido
- La variabilidad del servicio obliga a escalar VUs y aun así no garantiza el SLA

## Evidencia de la Última Ejecución

Resumen observado en la ejecución de k6:

- `checks_total = 3096`
- `checks_succeeded = 100.00%`
- `checks_failed = 0.00%`
- `http_reqs = 1032`
- `http_req_duration p(95) = 1.84s`
- `http_req_failed = 0.00%`
- `iterations = 1032`
- `vus = 6` con rango observado entre `6` y `37`

Trazas relevantes observadas:

- `executor = constant-arrival-rate`
- `rate = 21 iteraciones/s`
- `duration = 50s`
- `preAllocatedVUs = 20`
- `maxVUs = 60`
- `threshold http_reqs = rate>20` cumplido con `20.01671/s`
- `threshold http_req_duration = p(95)<1500` no cumplido, resultado `1.84s`
- `threshold http_req_failed = rate<0.03` cumplido con `0.00%`
- `dropped_iterations = 19`

## Conclusiones

La implementación final sí demuestra una prueba de carga funcional y correctamente instrumentada con k6, pero el sistema bajo prueba no cumple de forma estable el objetivo completo del ejercicio cuando se exige simultáneamente superar 20 TPS, mantener p95 menor a 1.5 segundos y sostener una tasa de error inferior al 3%.

### Conclusión de calidad

La principal causa de incumplimiento inicial sí estaba parcialmente en el diseño de la prueba, pero una vez corregidos el escenario de carga y la validación funcional, quedó en evidencia una limitación real del endpoint público: puede sostener el throughput mínimo y mantener error cero, pero no garantiza la latencia p95 requerida bajo esa presión.

### Conclusión práctica

El diseño actual deja una base sólida para continuar con pruebas de performance sobre el flujo de autenticación. La prueba ya no depende de una rampa de VUs poco precisa para medir TPS y produce resultados útiles para comparar ejecuciones futuras, pero también permite demostrar objetivamente que el SLA de latencia no es estable en este entorno externo.

## Recomendaciones

1. Mantener el escenario con `constant-arrival-rate` cuando el criterio principal sea throughput mínimo garantizado.
2. Separar perfiles de ejecución para smoke y performance si se necesita una validación rápida distinta a la prueba de carga.
3. Conservar validaciones alineadas al comportamiento real del endpoint público para evitar falsos fallos.
4. Reportar explícitamente que el endpoint público no asegura p95 menor a 1.5 segundos cuando se exige un throughput mayor a 20 TPS.
5. Si se requiere cumplimiento estable del SLA, ejecutar la prueba sobre un entorno controlado o una API propia en lugar de un servicio público compartido.

# Anexos

### Captura de la ejecución más reciente en dashboard de grafana mostrando los resultados clave y la configuración del escenario:

[![Captura-de-pantalla-2026-03-30-a-la(s)-11-49-22-a-m.png](https://i.postimg.cc/zf4Nc5JF/Captura-de-pantalla-2026-03-30-a-la(s)-11-49-22-a-m.png)](https://postimg.cc/cK7Pvptv)

### Captura de ejecucion en CLI

[![Captura-de-pantalla-2026-03-30-a-la(s)-11-56-43-a-m.png](https://i.postimg.cc/W3Dm6B8t/Captura-de-pantalla-2026-03-30-a-la(s)-11-56-43-a-m.png)](https://postimg.cc/mzsFT60G)
# Conclusiones del Ejercicio

## Resultado General

## Cumplimiento de Criterios

Todo esta implementado bajo principios de **Clean Code** y **SOLID** (enfocado principalmente en Responsabilidad Única - SRP):

1. **Separación de Perfiles (*Smoke* vs *Load*)**: 
   - Se crearon dos objetos separados en `config.js` (`smokeOptions` y `loadOptions`).
   - Se dividieron las pruebas en scripts independientes: `tests/login-smoke.js` para una validación rápida y `tests/login-load.js` para validar p(95), TPS sostenidos y errores.
   
3. **Manejo Explícito de Errores de Red**: 
   - Se expandió la función `login` dentro de `authSteps.js` para capturar y notificar en los logs posibles caídas de conexión (`connection refused`) y expiraciones relativas (`timeout` o `error_code===1050`).

4. **Línea de Base y Documentación**: 
   - Integración formal de la fórmula explícita de cálculos de carga (**TPS = total_reqs / duración**) en la documentación base y en las conclusiones.
   - Construcción de la tabla de resultados de múltiples ejecuciones para facilitar mediciones históricas.

## Línea Base de Ejecuciones

A continuación se presenta la tabla comparativa de resultados base para futuras referencias de rendimiento:

| Ejecución | Perfil     | VUs  | Iteraciones totales | Duración (s) | TPS promedio | Errores % | p(95) latencia | Cumple SLA |
|-----------|------------|------|---------------------|--------------|--------------|-----------|----------------|------------|
| \#1       | Load       | 6-37 | 1032                | 51.6         | 20.0         | 0.00%     | 1.84s          | ❌         |
| \#2       | Smoke      | 1    | 5                   | 0.8          | ~6.2         | 0.00%     | 1.30s          | ✅         |
| \#3       | Load       | 20   | 1051                | 50.4         | 20.85        | 0.00%     | 388.27ms       | ✅         |
| \#4       | Smoke      | 1    | 5                   | 1.8          | 2.80         | 0.00%     | 357.34ms       | ✅         |


La ejecución más reciente de la suite de login con k6 fue completamente exitosa y cumplió todos los umbrales definidos bajo una carga sostenida de más de 20 TPS.

- Feature ejecutada: `tests/login-load.js`
- Escenarios ejecutados: 1
- Escenarios exitosos: 1
- Escenarios fallidos: 0
- Tiempo total de la ejecución: ~50.4 s
- Ejecución en paralelo: 20 VUs preasignados, 60 VUs máximos configurados

## Hallazgos Principales

### 1. El cambio a carga controlada por tasa sí permitió sostener el objetivo de al menos 20 TPS

La configuración inicial basada en stages no garantizaba un throughput mínimo estable de 20 transacciones por segundo. Al migrar el escenario a `constant-arrival-rate`, la suite pasó a generar una carga constante y medible durante toda la ventana de ejecución.

Esto permitió:

- Garantizar una tasa objetivo superior al umbral mínimo requerido
- Medir el comportamiento del endpoint bajo carga sostenida
- Evitar resultados variables dependientes solo del ramp-up de usuarios virtuales.

La fórmula usada para evaluar TPS es explícita: **TPS = total_reqs / duración**.
- Alinear el diseño de la prueba con un criterio explícito de TPS

En la ejecución más reciente, la prueba alcanzó:

- `http_reqs = 20.8535/s`
- `iterations = 1051`

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

### 3. El endpoint público respondió dentro del SLA de latencia bajo carga sostenida

En la ejecución más reciente, el endpoint mantuvo tiempos de respuesta ampliamente por debajo del umbral de 1.5 segundos incluso superando los 20 TPS requeridos. Los percentiles registrados no presentaron degradación significativa.

Esto confirma que:

- La API sostiene más de 20 TPS con latencias estables
- El p95 de `http_req_duration` fue **388.27ms**, bien por debajo del umbral de 1500ms
- El p99 de `http_req_duration` fue **448.88ms**, dentro del umbral de 3000ms configurado
- La tasa de error observada es 0.00%, inferior al 3% permitido
- El comportamiento del servicio fue estable durante toda la ventana de 50 segundos

## Evidencia de la Última Ejecución

Resumen observado en la ejecución de k6 (perfil Load — ejecución \#3):

- `checks_total = 3153`
- `checks_succeeded = 100.00%`
- `checks_failed = 0.00%`
- `http_reqs = 1051`
- `http_req_duration avg = 359.66ms`
- `http_req_duration min = 341.81ms`
- `http_req_duration p(90) = 377.60ms`
- `http_req_duration p(95) = 388.27ms`
- `http_req_duration p(99) = 448.88ms`
- `http_req_duration max = 666.08ms`
- `iteration_duration avg = 360.44ms`
- `iteration_duration p(95) = 389.48ms`
- `iteration_duration p(99) = 449.37ms`
- `http_req_failed = 0.00%`
- `iterations = 1051`
- `vus = 20` (sin necesidad de escalar más allá del pool preasignado)

Trazas relevantes observadas:

- `executor = constant-arrival-rate`
- `rate = 21 iteraciones/s`
- `duration = 50s`
- `preAllocatedVUs = 20`
- `maxVUs = 60`
- `threshold http_reqs = rate>20` cumplido con `20.8535/s`
- `threshold http_req_duration = p(95)<1500` cumplido con `388.27ms`
- `threshold http_req_duration = p(99)<3000` cumplido con `448.88ms`
- `threshold http_req_failed = rate<0.03` cumplido con `0.00%`
- `threshold iteration_duration = p(95)<1500` cumplido con `389.48ms`
- `threshold iteration_duration = p(99)<3000` cumplido con `449.37ms`
- `dropped_iterations = 0`

## Conclusiones

La implementación final demuestra una prueba de carga funcional, correctamente instrumentada con k6, que cumple de forma simultánea los tres criterios del ejercicio: superar 20 TPS, mantener p95 menor a 1.5 segundos y sostener una tasa de error inferior al 3%.

### Conclusión de calidad

Las mejoras aplicadas al módulo de reporte (`summaryHelper.js`) eliminaron la ambigüedad en la lectura de métricas al separar explícitamente `http_req_duration` e `iteration_duration`, y al etiquetar de forma clara cada estadístico (mínimo, promedio, p90, p95, p99, máximo). Esto permite comparar los resultados directamente con los umbrales definidos, sin riesgo de confundir percentiles entre sí ni de interpretar el promedio como mínimo. El parseo defensivo de JSON en `validators.js` garantiza además que un fallo de deserialización no genere falsos negativos en los checks.

### Conclusión práctica

El diseño actual provee una base sólida y bien instrumentada para el flujo de autenticación. La prueba genera throughput controlado vía `constant-arrival-rate`, produce un resumen estructurado con todos los percentiles relevantes al finalizar cada run, y confirma que el endpoint público puede sostener más de 20 TPS con latencias muy por debajo del SLA cuando las condiciones de red son favorables. La inclusión del umbral p(99) y la métrica de `iteration_duration` añade visibilidad sobre el comportamiento en la cola de distribución.

## Recomendaciones

1. Mantener el escenario con `constant-arrival-rate` cuando el criterio principal sea throughput mínimo garantizado.
2. Conservar los perfiles separados de ejecución (smoke y load) para distinguir validación funcional rápida de validación de rendimiento bajo carga sostenida.
3. Conservar validaciones alineadas al comportamiento real del endpoint público para evitar falsos fallos.
4. Monitorear el p(99) en ejecuciones futuras como indicador temprano de degradación en la cola de latencia, dado que puede superar el p(95) de forma significativa bajo condiciones de red variables.
5. Si se requiere reproducibilidad completa del SLA en cualquier condición, ejecutar la prueba sobre un entorno controlado o una API propia en lugar de un servicio público compartido.

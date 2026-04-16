# k6 Login Testing

Proyecto de pruebas de carga con k6 para validar el endpoint de login de Fake Store API usando Docker, InfluxDB y Grafana.

## Ejercicio 2

[Ver documento InformeResultados.doc](https://docs.google.com/document/d/11bgOXNMNX_UzazduC5fuLM21YnCRTrJPV3cA6dJodFQ/edit?usp=sharing)

## Objetivo

La suite ejecuta autenticaciones concurrentes contra `https://fakestoreapi.com/auth/login` y valida tres criterios principales:

- throughput mayor a 20 TPS (donde **TPS = total_reqs / duración**)
- `p(95)` de `http_req_duration` menor a 1.5 segundos
- tasa de error menor a 3%

Adicionalmente valida que cada respuesta de login:

- retorne `200` o `201`
- incluya un token
- no retorne un token vacío

## Estructura del Proyecto

```text
k6-tests/
├── config.js
├── docker-compose.yml
├── data/
│   └── users.csv
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       └── datasources/
├── modules/
│   ├── authSteps.js
│   └── validators.js
├── tests/
│   └── login-smoke.js
├── CONCLUSIONES.md
└── README.md

```

## Requisitos

### 1. Prerequisitos:
** A continuación se describen las versiones de las dependencias y tecnologías necesarias para configurar y ejecutar el proyecto en su máquina local:
- **Máquina local** con sistema operativo macOS (o Windows 10/Linux).
- **IDE**: Visual Studio Code (o cualquier editor moderno como IntelliJ 2023.1).
- **Docker**: versión 24.0 o superior (debe estar iniciada en la máquina).
- **Docker Compose**: versión 2.0 o superior (viene incluido con Docker Desktop).
- **k6 (opcional)**: v1.7.0 (sólo si desea correr las ejecuciones por fuera del contenedor mediante consola local).

### 2. Comandos de instalación:
** Comandos básicos necesarios para descargar y levantar todas las dependencias e infraestructura en su máquina local:
- `docker-compose pull` (descarga y actualiza las imágenes definidas en el `docker-compose.yml`, como InfluxDB y Grafana).
- `docker-compose build` (construye la imagen del contenedor si hay volúmenes customizados de k6, opcional).
- `brew install k6` (si estás en macOS y deseas instalar la dependencia localmente de k6 usando Homebrew).

## Cómo Funciona

El flujo actual del proyecto es simple:

1. k6 carga usuarios desde `data/users.csv`.
2. Cada iteración toma un usuario y ejecuta `POST /auth/login`.
3. La lógica HTTP vive en `modules/authSteps.js`.
4. Las validaciones funcionales viven en `modules/validators.js`.
5. La configuración global de carga y thresholds vive en `config.js`.
6. Las métricas se envían a InfluxDB y se visualizan en Grafana.


## Levantar el Proyecto

Desde la raíz del repositorio, levanta la infraestructura:

```bash
docker-compose down --remove-orphans
docker-compose up -d
```

Verifica que los servicios estén arriba:

```bash
docker-compose ps
```

Servicios esperados:

- `influxdb`
- `grafana`
- `k6`

## Ejecutar la Prueba

La suite principal de carga es:

```bash
docker-compose run k6 run /k6-tests/tests/login-load.js
```

Si quieres correr solo la prueba de humo (smoke test):


```bash
docker-compose run k6 run /k6-tests/tests/login-smoke.js
```

Si quieres limpiar contenedores huérfanos antes de correr:

```bash
docker-compose run --remove-orphans k6 run /k6-tests/tests/login-smoke.js
```

## Configuración de la Carga

La carga actual está definida en `config.js` con un escenario `constant-arrival-rate`:

- `rate: 21`
- `timeUnit: 1s`
- `duration: 50s`
- `preAllocatedVUs: 20`
- `maxVUs: 60`

Thresholds activos:

- `http_req_duration: p(95) < 1500`
- `http_req_failed: rate < 0.03`
- `http_reqs: rate > 20`

## Datos de Entrada

El archivo `data/users.csv` contiene las credenciales usadas por la prueba.

Formato esperado:

```csv
user,passwd
usuario,password
```

Si agregas más usuarios, k6 los reutiliza entre VUs de forma circular.

## Ver Métricas en Grafana

Una vez levantado Docker, abre:

```text
http://localhost:3000/d/k6/k6-load-testing-results
```

Grafana queda provisionado automáticamente con InfluxDB como datasource.x

## Limitaciones Actuales

La suite apunta a una API pública compartida. Eso implica variabilidad real de rendimiento.

En las últimas ejecuciones se observó que:

- el throughput sí puede superar 20 TPS
- la tasa de error puede mantenerse en 0%
- el p95 no siempre se mantiene por debajo de 1.5 segundos

Por eso, este repo sirve tanto para validar el script como para evidenciar si el endpoint cumple o no el SLA bajo carga.

## Comandos Útiles

Ver logs de Grafana:

```bash
docker-compose logs grafana
```

Ver logs de InfluxDB:

```bash
docker-compose logs influxdb
```

## Archivos Clave

- `config.js`: configuración de escenarios de carga (`smokeOptions`, `loadOptions`), thresholds y configuración HTTP.
- `tests/login-smoke.js`: script para la prueba de humo rápida (Validación básica).
- `tests/login-load.js`: script principal para la prueba de carga y TPS sostenidos.
- `modules/authSteps.js`: llamada HTTP de login integrando además un manejo explícito de errores de red (timeout / con. refused).
- `modules/validators.js`: checkeo y aserciones limpias (sin código muerto).
- `data/users.csv`: usuarios usados durante la prueba.
- `CONCLUSIONES.md`: hallazgos y comprobaciones con la línea de base.

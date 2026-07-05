# Portfolio Website — DevOps Pipeline

Use Case 3 (web design agency portfolio site), built the same way as the
`taskmanager` reference project: same pom.xml dependency set, same
Actuator + Graphite config pattern, same Jenkins stage shapes, same
Docker → Kubernetes deploy path.

## Layout

```
portfolio-devops/
├── app/                     Spring Boot + Maven project
│   ├── pom.xml
│   ├── src/main/java/com/fernline/portfolio/
│   │   ├── PortfolioApplication.java
│   │   ├── config/GraphiteConfiguration.java   metrics registry
│   │   └── controller/HealthController.java    public /health for the UI badge
│   ├── src/main/resources/
│   │   ├── application.properties              actuator + graphite export config
│   │   └── static/                              html/css/js + projects.json, testimonials.json
│   └── Dockerfile
├── k8s/
│   ├── deployment.yaml      2 replicas, resource limits, actuator-based probes
│   └── service.yaml         NodePort 30080 (app), 30090 (actuator)
├── Jenkinsfile              checkout → mvn clean/compile/test/package → docker → k8s deploy → verify
└── monitoring/
    ├── docker-compose.yml   graphite + grafana + nagios
    ├── grafana/provisioning ...  datasource + dashboard auto-loaded on start
    └── nagios/conf.d/website.cfg  HTTP availability check (preconfigured for `kind`)
```

## Requirement → component map

| Requirement | Where |
|---|---|
| Centralized version control | This repo, pushed to GitHub — Jenkins' `Checkout` stage pulls from it |
| Automated deploy on approved update | `Jenkinsfile`: mvn build → test → package → image → `kubectl apply` |
| Hosted in a Docker container | `app/Dockerfile` (copies the jar `mvn package` produces) |
| Deployed via Kubernetes | `k8s/deployment.yaml`, `k8s/service.yaml` |
| Continuous availability monitoring | Nagios (`monitoring/nagios/conf.d/website.cfg`), `check_http` against `/health` |
| Infrastructure metrics collection | Graphite, fed by Micrometer's `GraphiteMeterRegistry` |
| Resource utilization dashboards | Grafana, provisioned dashboard reading from Graphite |

## How metrics actually get to Graphite

Unlike a hand-rolled setup, you don't write any metrics-pushing code here.
`spring-boot-starter-actuator` + `micrometer-registry-graphite` on the
classpath, plus the `management.graphite.metrics.export.*` properties in
`application.properties`, are enough on their own — Spring Boot
autoconfigures a `GraphiteMeterRegistry` and starts pushing JVM memory, CPU,
GC, and HTTP request metrics on a timer automatically.

`GraphiteConfiguration.java` defines that same bean explicitly, mirroring
the reference project — it's redundant with the properties-based
autoconfiguration, but makes the wiring visible instead of implicit. Either
one alone is sufficient.

Every metric also carries an `application=portfolio` and `pod=<hostname>`
tag (see `application.properties`) — `HOSTNAME` is set to the pod's name by
Kubernetes automatically. Without the `pod` tag, both replicas would write
to the same Graphite path and overwrite each other's data instead of
appearing as separate series.

**Heads up:** Micrometer's Graphite registry encodes tags into the metric
path itself (e.g. `jvm.memory.used.application.portfolio.pod.<name>.area.heap...`),
which is harder to predict than a flat path you write by hand. Once the
stack is running, browse Graphite's metrics tree (`http://localhost:8081`)
to find the real paths before wiring up Grafana panel queries — the
provisioned dashboard's queries are a starting point, not guaranteed to
match exactly on first run.

## Why the content is static JSON

`static/data/projects.json` and `testimonials.json` are what designers
edit. Spring Boot serves everything under `src/main/resources/static/` as-is
— no controller needed for content, same as how the reference project
serves its own static frontend. `script.js` fetches these directly at
`/data/projects.json`. A content update is: edit the JSON → commit → push
→ Jenkins ships it.

## Running it

**1. Website only, locally:**
```bash
cd app
./mvnw spring-boot:run       # http://localhost:8080
```

**2. Build the image and deploy to Kubernetes:**
```bash
cd app
./mvnw clean package
docker build -t portfolio-website:v1 .
kubectl apply -f ../k8s/deployment.yaml
kubectl apply -f ../k8s/service.yaml
kubectl get pods            # should show 2 Running pods
```
Site: `http://<node-ip>:30080` · Actuator: `http://<node-ip>:30090/actuator/health`

**3. Monitoring stack:**
```bash
cd monitoring
docker compose up -d
```
- Grafana → `http://localhost:3000` (admin/admin) — dashboard is pre-loaded
- Graphite web UI → `http://localhost:8081`
- Nagios → `http://localhost:8082` (nagiosadmin/nagios)

Preconfigured for `kind`: `docker-compose.yml` attaches the nagios
container to the `kind` docker network, and `website.cfg` addresses the
node as `kind-control-plane`. If your cluster has a different name, that
container is `<cluster-name>-control-plane` instead — check with
`docker ps --filter "name=control-plane"` and update `website.cfg`.

**4. CI/CD:** point a Jenkins job at this repo using `Jenkinsfile` at the
root. It expects `JDK25`, `Maven-3.9.16`, `docker`, and `kubectl` on the
agent — adjust the `tools {}` block and image/registry names for your setup.

## Not verified by compiling

This sandbox has no route to Maven Central, so the Java code here was
written carefully and cross-checked against the reference project, but
never actually run through `mvn compile`. Run it yourself before relying on
it — if something doesn't compile, it's most likely a dependency version
mismatch in `pom.xml`.


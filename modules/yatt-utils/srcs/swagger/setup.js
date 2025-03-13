import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

export default async function setUpSwagger(app, openapi) {
  await app.register(fastifySwagger, { openapi });
  await app.register(fastifySwaggerUi, {
    routePrefix: "/api-docs",
  });
}

"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import staticServe from '@fastify/static'
import Generator from "@asyncapi/generator"
import fs from "node:fs"

export default function build(opts = {}) {
  const app = Fastify(opts);

  const asyncapi_dir = "/documentation/asyncapi";
  const asyncapi_build_dir = "/build/asyncapi";
  const files = fs.readdirSync(asyncapi_dir);
  for (let filename of files) {
    if (!filename.endsWith(".yaml"))
      continue;
    const dir_name = filename.substring(0, filename.length - 5);
    try{
      const stat = fs.statSync(`${asyncapi_dir}/${filename}`);
      if (!stat.isFile())
        continue;
      if (filename.includes(filename.substring(0, filename.length - 5))) {
        const folderstat = fs.statSync(`${asyncapi_build_dir}/${dir_name}`);
        if (!folderstat.isDirectory())
          throw new Error(`Expected a folder for ${filename} but got a file`);
        const indexstat = fs.statSync(`${asyncapi_build_dir}/${dir_name}/index.html`);
        if (!indexstat.isFile())
          throw new Error(`Expected an index.html file in ${dir_name} but got a folder`);
        if (indexstat.mtimeMs > stat.mtimeMs)
          continue;
      }
    }
    catch (e) {console.error(e)}
    console.log(`Generating documentation for ${filename}`);
    const generator = new Generator("@asyncapi/html-template", `${asyncapi_build_dir}/${dir_name}`, 
      {
        templateParams: {
          singleFile: true
        },
        forceWrite: true,
    },);
    generator.generateFromFile(`${asyncapi_dir}/${filename}`).then(() => {;
      console.log(`Documentation generated for ${filename}`);
    }).catch((e) => {
      console.error(`Error generating documentation for ${filename}`);
      console.error(e);
    });
  }

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PACTH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authentication)
  });

  app.register(swagger, {
    mode: 'static',
    specification: {
      path: '/documentation/backend.yaml',
      postProcessor: function (swaggerObject) {
        return swaggerObject
      },
    }
  })

  app.register(swaggerUI, {
    routePrefix: '/',
  });

  app.register(staticServe, {
    prefix: '/asyncapi',
    root: asyncapi_build_dir,
  });

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}

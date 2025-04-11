"use strict";

import Fastify from "fastify";
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import staticServe from '@fastify/static'
import Generator from "@asyncapi/generator"
import fs from "node:fs"

async function generateAsyncAPIDocs(asyncapi_build_dir) {
  let install = true;
  const asyncapi_dir = "/documentation/asyncapi";
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
    catch (e) {}
    console.log(`Generating documentation for ${filename}`);
    const generator = new Generator("@asyncapi/html-template", `${asyncapi_build_dir}/${dir_name}`, 
      {
        templateParams: {
          singleFile: true
        },
        forceWrite: true,
    },);
    if (install)
      await generator.installTemplate();
    install = false;
    generator.generateFromFile(`${asyncapi_dir}/${filename}`).then(() => {;
      console.log(`Documentation generated for ${filename}`);
    }).catch((e) => {
      console.error(`Error generating documentation for ${filename}`);
      console.error(e);
    });
  }
}

export default function build(opts = {}) {
  const app = Fastify(opts);
  const asyncapi_build_dir = "/build/asyncapi";

  generateAsyncAPIDocs(asyncapi_build_dir);

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

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a graceful shutdown
  });

  const serverShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    app.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', serverShutdown);
  process.on('SIGTERM', serverShutdown);

  return app;
}

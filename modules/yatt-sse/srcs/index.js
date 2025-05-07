import fp from "fastify-plugin";

function plugin(fastify, options, done) {
  fastify.decorateReply('sse', function handler({event, data}) {
    if (!this.raw.headersSent) {
      this.raw.writeHead(200, {
        ...this.getHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      this.raw.write(`retry: 0\n`);
    }
    const message = 
    `event: ${event}\n`
    + (data ? `data: ${data}\n` : '')
    + `\n`;
    this.raw.write(message);
	});
  fastify.decorateReply('sseComment', function handler(str) {
    if (!this.raw.headersSent) {
      this.raw.writeHead(200, {
        ...this.getHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      this.raw.write(`retry: 0\n`);
    }
    const message = `: ${str}\n\n`;
    this.raw.write(message);
  });
  done();
}

export default fp(plugin, {
  name: "yatt-sse",
});

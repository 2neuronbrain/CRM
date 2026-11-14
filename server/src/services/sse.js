/**
 * Server-Sent Events (SSE) Manager for real-time frontend updates
 */
class SSEManager {
  constructor() {
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        console.error('[SSE] Failed to write to client:', err.message);
        this.clients.delete(client);
      }
    }
  }

  getConnectedCount() {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
export default sseManager;

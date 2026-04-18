import { NextResponse } from 'next/server';
import net from 'net';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let host = body.host;
    let port = body.port || 23; // Default Telnet port for AS400 terminals

    if (!host) {
      return NextResponse.json({ success: false, error: 'Host mancante' }, { status: 400 });
    }

    // Supporta URL completi (es. http://192.168.1.1:6000)
    try {
      if (host.includes('://')) {
        const url = new URL(host);
        host = url.hostname;
        port = parseInt(url.port, 10) || (url.protocol === 'https:' ? 443 : 80);
      } else if (host.includes(':')) {
        // Supporta formato host:port
        const parts = host.split(':');
        host = parts[0];
        port = parseInt(parts[1], 10) || port;
      }
    } catch (e) {
      // Se URL fails, proviamo a pulire i caratteri extra come "::" alla fine
      host = host.replace(/^https?:\/\//, '').split(/[/?#:]/)[0];
    }

    const isConnected = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000); // 3 secondi di timeout

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });

    return NextResponse.json({ success: isConnected });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 });
  }
}

import * as tmi from 'tmi.js'

export function createTwitchClient(channel: string) {
  return new tmi.Client({
    options: { debug: false },
    connection: { secure: true, reconnect: true },
    channels: [channel],
  })
}

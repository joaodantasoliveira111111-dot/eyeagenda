import { createSignal, createEffect, onCleanup, onMount } from 'solid-js';
import { sb } from '@/lib/supabase';

interface RealtimeOptions {
  onAgendamentosChange?: () => void;
  onProfilesChange?: () => void;
}

export function useRealtime(options: RealtimeOptions = {}) {
  const [connected, setConnected] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let channel: ReturnType<typeof sb.channel> | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  function subscribe(): void {
    if (channel) {
      channel.unsubscribe();
    }

    channel = sb.channel('eye-agenda-changes', {
      config: {
        broadcast: { self: false },
        presence: { key: '' },
      },
    })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        (payload) => {
          console.log('[Realtime] agendamentos:', payload.eventType, payload.new?.id || payload.old?.id);
          options.onAgendamentosChange?.();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          console.log('[Realtime] profiles:', payload.eventType, payload.new?.id || payload.old?.id);
          options.onProfilesChange?.();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          setError(null);
          startHeartbeat();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnected(false);
          setError(err?.message || `Connection ${status.toLowerCase()}`);
          scheduleReconnect();
        }
      });
  }

  function startHeartbeat(): void {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (channel && connected()) {
        channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { ts: Date.now() },
        });
      }
    }, 25000);
  }

  function scheduleReconnect(): void {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
      console.log('[Realtime] Reconnecting...');
      subscribe();
    }, 5000);
  }

  onMount(() => {
    subscribe();
  });

  onCleanup(() => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (channel) {
      channel.unsubscribe();
      channel = null;
    }
  });

  return {
    get connected() { return connected(); },
    get error() { return error(); },
    reconnect: subscribe,
  };
}
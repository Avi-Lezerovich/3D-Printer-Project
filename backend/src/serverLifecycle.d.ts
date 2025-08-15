import type http from 'http'
interface Closeable { close?: () => Promise<any> | any; disconnect?: () => Promise<any> | any }
export declare function setupGracefulShutdown(server: http.Server, deps?: Closeable[]): void

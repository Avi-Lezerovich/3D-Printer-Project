// Minimal stub so TypeScript doesn't error before prisma client is generated.
// When you run `npx prisma generate` (@prisma/client) the real types override this.
declare module '@prisma/client' {
  export class PrismaClient { [k: string]: any }
}

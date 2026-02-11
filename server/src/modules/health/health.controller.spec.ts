import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('liveness should return ok status', () => {
    const controller = new HealthController({} as any, {} as any, {} as any);
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('number');
  });
});

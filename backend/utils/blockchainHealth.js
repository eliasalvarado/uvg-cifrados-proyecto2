// utils/blockchainHealth.js
let healthy = true;                          // por defecto OK

export const setHealthy = (state) => { healthy = state; };
export const isHealthy = () => healthy;

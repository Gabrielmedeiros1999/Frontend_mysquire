export function useRolarDado() {
  /** Retorna número entre 0 e 20 */
  const rolarD20 = () => Math.floor(Math.random() * 21);

  return { rolarD20 };
}

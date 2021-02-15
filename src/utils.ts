export function getServiceFromKey(key?: string) {
  if (key) {
    const [type, service] = key.split(':');
    if (type === 'service') return service;
  }
  return;
}

export function getServiceIDFromConfig(serviceConfigStr: string) {
  const [serviceID] = serviceConfigStr.split('@');
  return serviceID;
}

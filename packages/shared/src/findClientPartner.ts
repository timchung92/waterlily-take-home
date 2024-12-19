export function findClientPartner(
  client: Client,
  clients: Client[],
): Client | undefined {
  return clients.find(
    clientFromList =>
      clientFromList.clientId &&
      client.partnerClientId &&
      clientFromList.clientId === client.partnerClientId,
  );
}

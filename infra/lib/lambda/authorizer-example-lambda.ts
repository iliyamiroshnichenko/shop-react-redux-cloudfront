export async function handler(event: any) {
  return {
    message: `SUCCESS with message ${event.message} 🎉`,
  };
}

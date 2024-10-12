import { mockProducts } from "../mockProducts";

export async function main() {
  return {
    body: JSON.stringify(mockProducts),
    statusCode: 200,
  };
}

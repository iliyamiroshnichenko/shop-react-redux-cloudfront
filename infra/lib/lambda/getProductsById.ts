import { mockProducts } from "../mockProducts";

export async function main(event: { pathParameters: { productId: string } }) {
  const { productId } = event.pathParameters;

  const product = mockProducts.find((p) => p.id === productId);

  return {
    body: JSON.stringify(product || { error: "Product not found" }),
    statusCode: product ? 200 : 404,
  };
}

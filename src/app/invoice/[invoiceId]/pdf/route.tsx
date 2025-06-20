export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  return Response.json({
    test: params.invoiceId,
  });
}

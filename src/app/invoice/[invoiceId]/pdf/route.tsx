export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  const { invoiceId } = params;

  return Response.json({
    message: `Generating PDF for invoice ${invoiceId}`,
  });
}

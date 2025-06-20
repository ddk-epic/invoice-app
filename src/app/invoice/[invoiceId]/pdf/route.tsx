export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  return Response.json({
    message: `Generating PDF for invoice ${invoiceId}`,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	if(!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/", "/customers", "/suppliers", "/sales", "/sales/quotation", "/sales/sale-order", "/sales/delivery-note", "/sales/return-delivery-note", "/sales/advance-invoice", "/sales/arrears-invoice", "/sales/refund-invoice", "/sales/invoice", "/purchase", "/purchase/order", "/purchase/requisition", "/purchase/goods-received", "/purchase/return-goods-received", "/purchase/bills", "/purchase/advance-bill", "/purchase/arrears-bill", "/purchase/refund-bill", "/purchases", "/expenses", "/ledger", "/pdc", "/products", "/tax-center", "/employees", "/employees/attendance", "/employees/payroll-settings", "/employees/payroll-periods", "/employees/salary-payments", "/employees/additions-deductions", "/employees/payroll-generation", "/chart-of-account", "/reports", "/inventory", "/orders", "/clients"], // Apply middleware to specific routes
};
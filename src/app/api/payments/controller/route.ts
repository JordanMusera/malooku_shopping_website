import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/config/database';
import Payment from '@/app/models/payments';
import PaymentAttempt from '@/app/models/payment_attempt';
import User from '@/app/models/user';
import { requireAdmin } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;
    await dbConnect();

    // Attempts are the source of truth for in-flight transactions. The payment
    // ledger also includes their settled status and receipt details.
    const [attempts, ledger] = await Promise.all([
      PaymentAttempt.find({}).sort({ createdAt: -1 }).limit(500).lean(),
      Payment.find({}).sort({ createdAt: -1 }).limit(500).lean(),
    ]);
    const ledgerById = new Map(ledger.map((payment: any) => [String(payment._id), payment]));
    const attemptIds = new Set(attempts.map((attempt: any) => String(attempt._id)));
    const records = [
      ...attempts.map((attempt: any) => {
        const payment: any = ledgerById.get(String(attempt._id));
        const confirmation = attempt.confirmation || {};
        return {
          id: String(attempt._id),
          userId: attempt.userId,
          state: confirmation.state === 'paid' || attempt.state === 'paid' ? 'paid' : attempt.state || payment?.state || 'pending',
          amount: attempt.amount ?? payment?.amount ?? 0,
          currency: payment?.currency || 'KES',
          environment: attempt.environment || payment?.environment || 'unknown',
          checkoutId: attempt.checkoutId || payment?.checkoutId || '',
          receiptNumber: confirmation.receiptNumber || payment?.receiptNumber || '',
          transactionDate: confirmation.transactionDate || payment?.transactionDate || '',
          lastResultCode: attempt.lastResultCode || payment?.lastResultCode || '',
          message: attempt.message || payment?.message || '',
          createdAt: attempt.createdAt || payment?.createdAt || null,
          confirmedAt: attempt.confirmedAt || payment?.confirmedAt || null,
        };
      }),
      ...ledger.filter((payment: any) => !attemptIds.has(String(payment._id))).map((payment: any) => ({
        id: String(payment._id), userId: payment.userId, state: payment.state || 'pending', amount: payment.amount || 0,
        currency: payment.currency || 'KES', environment: payment.environment || 'unknown', checkoutId: payment.checkoutId || '',
        receiptNumber: payment.receiptNumber || '', transactionDate: payment.transactionDate || '',
        lastResultCode: payment.lastResultCode || '', message: payment.message || '', createdAt: payment.createdAt || null,
        confirmedAt: payment.confirmedAt || null,
      })),
    ].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const userIds = Array.from(new Set(records.map((record: any) => record.userId).filter(Boolean)));
    const users = await User.find({ _id: { $in: userIds } }).select('_id fullname username email').lean();
    const userById = new Map(users.map((user: any) => [String(user._id), user]));
    return reply({ success: true, content: records.map((record: any) => {
      const user: any = userById.get(String(record.userId));
      return { ...record, customer: user?.fullname || user?.username || user?.email || 'Customer' };
    }) });
  } catch {
    return reply({ success: false, message: 'Unable to load payment records. Please try again.' }, 503);
  }
}

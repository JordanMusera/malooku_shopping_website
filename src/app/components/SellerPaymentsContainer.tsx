"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FiCreditCard, FiRefreshCw } from 'react-icons/fi';

interface PaymentRecord {
  id: string;
  customer: string;
  state: string;
  amount: number;
  currency: string;
  environment: string;
  checkoutId: string;
  receiptNumber: string;
  transactionDate: string;
  lastResultCode: string;
  message: string;
  createdAt: string | null;
  confirmedAt: string | null;
}

const money = (amount: number, currency: string) => `${currency || 'KES'} ${Number(amount || 0).toLocaleString('en-KE')}`;
const shortId = (id: string) => id ? id.slice(-8).toUpperCase() : '—';

function statusLabel(state: string) {
  const normalized = (state || 'pending').toLowerCase();
  return normalized === 'paid' ? 'Confirmed' : normalized === 'review' ? 'Needs review' : normalized === 'failed' ? 'Failed' : normalized === 'starting' ? 'Starting' : 'Pending';
}

export default function SellerPaymentsContainer() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const loadPayments = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/payments/controller', { cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.content)) throw new Error(data.message || 'Unable to load payments.');
      setPayments(data.content);
    } catch (reason) {
      if (!signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load payments. Please try again.');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments, refresh]);

  const summary = useMemo(() => ({
    total: payments.length,
    confirmed: payments.filter(payment => payment.state === 'paid').length,
    awaiting: payments.filter(payment => ['starting', 'pending'].includes(payment.state)).length,
    received: payments.filter(payment => payment.state === 'paid').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
  }), [payments]);

  const columns: ColumnsType<PaymentRecord> = [
    { title: 'Payment', dataIndex: 'id', key: 'id', render: (id: string) => <span className="admin-payment-ref">#{shortId(id)}</span> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer', ellipsis: true },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (_: number, record) => <strong>{money(record.amount, record.currency)}</strong> },
    { title: 'Status', dataIndex: 'state', key: 'state', render: (state: string) => <span className={`admin-status status-${state}`}>{statusLabel(state)}</span> },
    { title: 'M-Pesa receipt', dataIndex: 'receiptNumber', key: 'receiptNumber', render: (receipt: string) => receipt || <span className="admin-muted">Not received</span> },
    { title: 'Environment', dataIndex: 'environment', key: 'environment', render: (value: string) => <span className="admin-payment-environment">{value || 'unknown'}</span> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (value: string | null) => value ? new Date(value).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
  ];

  return <div className="admin-payments-page">
    <section className="admin-payment-stats" aria-label="Payment summary">
      <article className="admin-payment-stat"><span>Total payment attempts</span><strong>{summary.total.toLocaleString()}</strong></article>
      <article className="admin-payment-stat"><span>Confirmed transactions</span><strong>{summary.confirmed.toLocaleString()}</strong></article>
      <article className="admin-payment-stat"><span>Awaiting confirmation</span><strong>{summary.awaiting.toLocaleString()}</strong></article>
      <article className="admin-payment-stat"><span>Confirmed amount</span><strong>{money(summary.received, 'KES')}</strong></article>
    </section>
    <section className="admin-card admin-data-section admin-payments-card">
      <div className="admin-card-heading"><div><h2>Payment activity</h2><p>M-Pesa requests and confirmed receipts, newest first.</p></div><button className="admin-text-button" onClick={() => setRefresh(value => value + 1)} disabled={loading}><FiRefreshCw className={loading ? 'admin-refreshing' : ''}/> Refresh</button></div>
      {error ? <div className="admin-products-state" role="alert"><h3>Payments could not be loaded</h3><p>{error}</p><button className="admin-primary" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> : !loading && payments.length === 0 ? <div className="admin-empty admin-payment-empty"><FiCreditCard/><h3>No payment attempts yet</h3><p>When a customer starts checkout, the request and its M-Pesa confirmation will appear here.</p></div> : <Table<PaymentRecord> rowKey="id" columns={columns} dataSource={payments} loading={loading} scroll={{ x: 980 }} pagination={{ pageSize: 10, showSizeChanger: false }} expandable={{ expandedRowRender: record => <div className="admin-payment-details"><span><small>Checkout request</small>{record.checkoutId || 'Not assigned'}</span><span><small>Transaction time</small>{record.transactionDate || (record.confirmedAt ? new Date(record.confirmedAt).toLocaleString('en-KE') : 'Not confirmed')}</span><span><small>Result code</small>{record.lastResultCode || '—'}</span><span><small>Latest update</small>{record.message || statusLabel(record.state)}</span></div> }} />}
    </section>
  </div>;
}

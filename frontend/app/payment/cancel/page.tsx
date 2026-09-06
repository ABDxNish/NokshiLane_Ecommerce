import Link from 'next/link';


export default function PaymentCancelPage() {
  return (
    <section className="result-page">
      <div className="result-card">
        <span>
          PAYMENT UPDATE
        </span>

        <h1>
          Payment cancelled
        </h1>

        <p>
          You cancelled the payment.
          You can return to the store
          and place another order.
        </p>

        <div className="result-actions">
          <Link
            href="/shop"
            className="primary-button"
          >
            Continue shopping
          </Link>

          <Link
            href="/orders"
            className="outline-button"
          >
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
}
